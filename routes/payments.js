const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const ChargingStation = require('../models/ChargingStation');
const auth = require('../middleware/auth');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', auth, [
  body('bookingId').isMongoId().withMessage('Valid booking ID required')
], async (req, res) => {
  try {
    if (req.user.role !== 'ev_owner') {
      return res.status(403).json({ message: 'Access denied. EV owners only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.userId,
      status: 'booked'
    }).populate('station', 'name chargingRate');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // Create payment intent with automatic payment methods (Card, UPI, etc.)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // Convert to cents
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.userId,
        stationId: booking.station._id.toString()
      },
      description: `EV Charging at ${booking.station.name}`
    });

    // Update booking with payment intent ID
    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: booking.totalAmount,
      currency: 'inr'
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm payment
router.post('/confirm-payment', auth, [
  body('bookingId').isMongoId().withMessage('Valid booking ID required'),
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID required')
], async (req, res) => {
  try {
    if (req.user.role !== 'ev_owner') {
      return res.status(403).json({ message: 'Access denied. EV owners only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.userId,
      paymentIntentId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update booking status
      booking.paymentStatus = 'completed';
      booking.status = 'booked';
      await booking.save();

      // Update station available slots
      const station = await ChargingStation.findById(booking.station);
      if (station) {
        station.availableSlots = Math.max(0, station.availableSlots - 1);
        await station.save();
      }

      res.json({
        message: 'Payment confirmed successfully',
        booking: {
          id: booking._id,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          totalAmount: booking.totalAmount
        }
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();

      res.status(400).json({
        message: 'Payment failed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment status
router.get('/status/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.userId
    }).select('paymentStatus paymentIntentId totalAmount');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
        res.json({
          paymentStatus: booking.paymentStatus,
          stripeStatus: paymentIntent.status,
          amount: booking.totalAmount,
          currency: 'inr'
        });
      } catch (stripeError) {
        res.json({
          paymentStatus: booking.paymentStatus,
          stripeStatus: 'unknown',
          amount: booking.totalAmount,
          currency: 'inr'
        });
      }
    } else {
      res.json({
        paymentStatus: booking.paymentStatus,
        stripeStatus: 'none',
        amount: booking.totalAmount,
        currency: 'inr'
      });
    }
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refund payment (for station owners)
router.post('/refund', auth, [
  body('bookingId').isMongoId().withMessage('Valid booking ID required'),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    if (req.user.role !== 'station_owner') {
      return res.status(403).json({ message: 'Access denied. Station owners only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('station', 'owner');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the station
    if (booking.station.owner._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({ message: 'Cannot refund incomplete payment' });
    }

    if (booking.paymentIntentId) {
      try {
        // Create refund in Stripe
        const refund = await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
          reason: 'requested_by_customer',
          metadata: {
            bookingId: booking._id.toString(),
            reason: reason || 'Station owner refund'
          }
        });

        // Update booking status
        booking.paymentStatus = 'refunded';
        booking.status = 'cancelled';
        await booking.save();

        // Update station available slots
        const station = await ChargingStation.findById(booking.station._id);
        if (station) {
          station.availableSlots = Math.min(station.totalSlots, station.availableSlots + 1);
          await station.save();
        }

        res.json({
          message: 'Refund processed successfully',
          refundId: refund.id,
          amount: refund.amount / 100, // Convert from cents
          currency: refund.currency
        });
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        res.status(500).json({ message: 'Refund failed. Please contact support.' });
      }
    } else {
      res.status(400).json({ message: 'No payment intent found for this booking' });
    }
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment history for station owner
router.get('/station/:stationId/history', auth, async (req, res) => {
  try {
    if (req.user.role !== 'station_owner') {
      return res.status(403).json({ message: 'Access denied. Station owners only.' });
    }

    const { stationId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Verify station ownership
    const station = await ChargingStation.findOne({
      _id: stationId,
      owner: req.user.userId
    });

    if (!station) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    let query = { station: stationId };
    if (status) {
      query.paymentStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .select('paymentStatus totalAmount createdAt startTime endTime slotNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    // Calculate total revenue
    const revenueStats = await Booking.aggregate([
      { $match: { station: stationId, paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      revenue: revenueStats[0] || { totalRevenue: 0, totalBookings: 0 }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;





