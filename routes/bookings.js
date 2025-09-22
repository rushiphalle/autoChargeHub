const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const ChargingStation = require('../models/ChargingStation');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new booking
router.post('/', auth, [
  body('stationId').isMongoId().withMessage('Valid station ID required'),
  body('slotNumber').isInt({ min: 1 }).withMessage('Valid slot number required'),
  body('startTime').isISO8601().withMessage('Valid start time required'),
  body('duration').isFloat({ min: 0.5 }).withMessage('Duration must be at least 0.5 hours'),
  body('vehicleInfo.make').optional().trim(),
  body('vehicleInfo.model').optional().trim(),
  body('vehicleInfo.licensePlate').optional().trim()
], async (req, res) => {
  try {
    if (req.user.role !== 'ev_owner') {
      return res.status(403).json({ message: 'Access denied. EV owners only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { stationId, slotNumber, startTime, duration, vehicleInfo, specialRequests } = req.body;

    // Get station details
    const station = await ChargingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    if (!station.isActive) {
      return res.status(400).json({ message: 'Charging station is not active' });
    }

    if (slotNumber > station.totalSlots) {
      return res.status(400).json({ message: 'Invalid slot number' });
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 60 * 1000));

    // Check if slot is available
    const conflictingBooking = await Booking.findOne({
      station: stationId,
      slotNumber,
      status: { $in: ['booked', 'in_progress'] },
      $or: [
        {
          startTime: { $lt: endDateTime },
          endTime: { $gt: startDateTime }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Slot is not available during this time' });
    }

    // Check if slot is blocked by owner
    const isBlocked = station.blockedSlots.some(blocked => 
      blocked.slotNumber === slotNumber &&
      blocked.startTime < endDateTime &&
      blocked.endTime > startDateTime
    );

    if (isBlocked) {
      return res.status(400).json({ message: 'Slot is blocked during this time' });
    }

    // Calculate total amount
    const totalAmount = duration * station.chargingRate;

    // Create booking
    const booking = new Booking({
      user: req.user.userId,
      station: stationId,
      slotNumber,
      startTime: startDateTime,
      endTime: endDateTime,
      duration,
      totalAmount,
      vehicleInfo: vehicleInfo || {},
      specialRequests
    });

    await booking.save();
    await booking.populate('station', 'name address chargingRate owner');
    await booking.populate('user', 'name email phone');

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment status (COD support)
router.put('/:id/payment-status', auth, async (req, res) => {
  try {
    const { status, method } = req.body;

    if (req.user.role !== 'ev_owner') {
      return res.status(403).json({ message: 'Access denied. EV owners only.' });
    }

    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (method !== 'cod') {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.userId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.paymentStatus = status;
    await booking.save();

    // If COD completed, decrement available slots similar to online confirmation
    if (status === 'completed') {
      const station = await ChargingStation.findById(booking.station);
      if (station) {
        station.availableSlots = Math.max(0, station.availableSlots - 1);
        await station.save();
      }
    }

    res.json({
      message: 'Payment status updated',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount
      }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user.userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('station', 'name address chargingRate')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings for station owner (across all their stations)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'ev_owner') {
      // For EV owners, redirect to my-bookings
      return res.redirect('/api/bookings/my-bookings');
    }
    
    if (req.user.role !== 'station_owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { station, status, paymentStatus, page = 1, limit = 10 } = req.query;
    
    // First, get all stations owned by this user
    const userStations = await ChargingStation.find({ owner: req.user.userId }).select('_id');
    const stationIds = userStations.map(s => s._id);
    
    if (stationIds.length === 0) {
      return res.json({
        bookings: [],
        totalPages: 0,
        currentPage: 1,
        total: 0
      });
    }

    // Build query for bookings
    let query = { station: { $in: stationIds } };
    
    if (station) {
      query.station = station;
    }
    if (status) {
      query.status = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('station', 'name address chargingRate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get station owner's bookings
router.get('/station/:stationId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'station_owner') {
      return res.status(403).json({ message: 'Access denied. Station owners only.' });
    }

    const { stationId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

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
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('station', 'name address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get station bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single booking
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('station', 'name address chargingRate owner');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    if (req.user.role === 'ev_owner' && booking.user._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'station_owner' && booking.station.owner._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.put('/:id/status', auth, [
  body('status').isIn(['booked', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('station', 'owner');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    if (req.user.role === 'ev_owner' && booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'station_owner' && booking.station.owner._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add rating and review
router.post('/:id/review', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim()
], async (req, res) => {
  try {
    if (req.user.role !== 'ev_owner') {
      return res.status(403).json({ message: 'Access denied. EV owners only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, review } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.userId,
      status: 'completed'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Completed booking not found' });
    }

    booking.rating = rating;
    if (review) booking.review = review;

    await booking.save();

    res.json({
      message: 'Review added successfully',
      booking
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.userId,
      status: 'booked'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Active booking not found' });
    }

    // Check if booking can be cancelled (at least 1 hour before start time)
    const oneHourBefore = new Date(booking.startTime.getTime() - (60 * 60 * 1000));
    if (new Date() > oneHourBefore) {
      return res.status(400).json({ 
        message: 'Booking cannot be cancelled less than 1 hour before start time' 
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available slots for a station and time range
router.get('/availability/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Start time and end time are required' });
    }

    const station = await ChargingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    // Get all bookings for this time range
    const bookings = await Booking.find({
      station: stationId,
      status: { $in: ['booked', 'in_progress'] },
      $or: [
        {
          startTime: { $lt: endDateTime },
          endTime: { $gt: startDateTime }
        }
      ]
    });

    // Get blocked slots
    const blockedSlots = station.blockedSlots.filter(blocked => 
      blocked.startTime < endDateTime &&
      blocked.endTime > startDateTime
    );

    // Find available slots
    const bookedSlots = new Set(bookings.map(b => b.slotNumber));
    const blockedSlotNumbers = new Set(blockedSlots.map(b => b.slotNumber));
    
    const availableSlots = [];
    for (let i = 1; i <= station.totalSlots; i++) {
      if (!bookedSlots.has(i) && !blockedSlotNumbers.has(i)) {
        availableSlots.push(i);
      }
    }

    res.json({
      station: {
        name: station.name,
        totalSlots: station.totalSlots,
        chargingRate: station.chargingRate
      },
      availableSlots,
      timeRange: {
        start: startDateTime,
        end: endDateTime
      }
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;





