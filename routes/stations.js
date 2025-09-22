const express = require('express');
const { body, validationResult } = require('express-validator');
const ChargingStation = require('../models/ChargingStation');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all charging stations (for EV owners)
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    const stations = await ChargingStation.find(query)
      .populate('owner', 'name email phone')
      .select('-blockedSlots');

    res.json(stations);
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single station by ID
router.get('/:id', async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id)
      .populate('owner', 'name email phone');
    
    if (!station) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    res.json(station);
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new charging station (station owners only)
router.post('/', auth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Station name is required'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('totalSlots').isInt({ min: 1 }).withMessage('Total slots must be at least 1'),
  body('chargingRate').isFloat({ min: 0 }).withMessage('Charging rate must be positive'),
  body('operatingHours.open').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid opening time format'),
  body('operatingHours.close').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid closing time format')
], async (req, res) => {
  try {
    if (req.user.role !== 'station_owner') {
      return res.status(403).json({ message: 'Access denied. Station owners only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      address,
      latitude,
      longitude,
      totalSlots,
      chargingRate,
      amenities,
      operatingHours
    } = req.body;

    const station = new ChargingStation({
      name,
      description,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      owner: req.user.userId,
      totalSlots: parseInt(totalSlots),
      availableSlots: parseInt(totalSlots),
      chargingRate: parseFloat(chargingRate),
      amenities: amenities || [],
      operatingHours: operatingHours || { open: '06:00', close: '22:00' }
    });

    await station.save();
    await station.populate('owner', 'name email phone');

    res.status(201).json({
      message: 'Charging station created successfully',
      station
    });
  } catch (error) {
    console.error('Create station error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stations owned by current user
router.get('/owner/my-stations', auth, async (req, res) => {
  try {
    if (req.user.role !== 'station_owner') {
      return res.status(403).json({ message: 'Access denied. Station owners only.' });
    }

    const stations = await ChargingStation.find({ owner: req.user.userId })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(stations);
  } catch (error) {
    console.error('Get owner stations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update charging station
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('address').optional().trim().isLength({ min: 5 }),
  body('totalSlots').optional().isInt({ min: 1 }),
  body('chargingRate').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    if (req.user.role !== 'station_owner') {
      return res.status(403).json({ message: 'Access denied. Station owners only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const station = await ChargingStation.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!station) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    const updateData = req.body;
    
    // Update available slots if total slots changed
    if (updateData.totalSlots && updateData.totalSlots !== station.totalSlots) {
      const slotDifference = updateData.totalSlots - station.totalSlots;
      updateData.availableSlots = Math.max(0, station.availableSlots + slotDifference);
    }

    const updatedStation = await ChargingStation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    res.json({
      message: 'Charging station updated successfully',
      station: updatedStation
    });
  } catch (error) {
    console.error('Update station error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block slots for specific period
router.post('/:id/block-slots', auth, [
  body('slotNumber').isInt({ min: 1 }).withMessage('Valid slot number required'),
  body('startTime').isISO8601().withMessage('Valid start time required'),
  body('endTime').isISO8601().withMessage('Valid end time required'),
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

    const { slotNumber, startTime, endTime, reason } = req.body;

    const station = await ChargingStation.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!station) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    if (slotNumber > station.totalSlots) {
      return res.status(400).json({ message: 'Invalid slot number' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      station: req.params.id,
      slotNumber,
      status: { $in: ['booked', 'in_progress'] },
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Slot is already booked during this time' });
    }

    // Add blocked slot
    station.blockedSlots.push({
      slotNumber,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason: reason || 'Maintenance'
    });

    await station.save();

    res.json({
      message: 'Slot blocked successfully',
      station
    });
  } catch (error) {
    console.error('Block slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get station statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'station_owner') {
      return res.status(403).json({ message: 'Access denied. Station owners only.' });
    }

    const station = await ChargingStation.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!station) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    const totalBookings = await Booking.countDocuments({ station: req.params.id });
    const completedBookings = await Booking.countDocuments({ 
      station: req.params.id, 
      status: 'completed' 
    });
    const activeBookings = await Booking.countDocuments({ 
      station: req.params.id, 
      status: { $in: ['booked', 'in_progress'] } 
    });
    
    const totalRevenue = await Booking.aggregate([
      { $match: { station: req.params.id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          station: req.params.id, 
          status: 'completed',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      station: {
        name: station.name,
        totalSlots: station.totalSlots,
        availableSlots: station.availableSlots
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        active: activeBookings
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get station stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete charging station
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'station_owner') {
      return res.status(403).json({ message: 'Access denied. Station owners only.' });
    }

    const station = await ChargingStation.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!station) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      station: req.params.id,
      status: { $in: ['booked', 'in_progress'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete station with active bookings' 
      });
    }

    await ChargingStation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Charging station deleted successfully' });
  } catch (error) {
    console.error('Delete station error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;





