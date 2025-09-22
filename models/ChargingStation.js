const mongoose = require('mongoose');

const chargingStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalSlots: {
    type: Number,
    required: true,
    min: 1
  },
  availableSlots: {
    type: Number,
    required: true,
    min: 0
  },
  chargingRate: {
    type: Number,
    required: true, // Rate per hour in INR
    min: 0
  },
  amenities: [{
    type: String,
    trim: true
  }],
  operatingHours: {
    open: {
      type: String,
      required: true,
      default: '06:00'
    },
    close: {
      type: String,
      required: true,
      default: '22:00'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  blockedSlots: [{
    slotNumber: Number,
    startTime: Date,
    endTime: Date,
    reason: String
  }],
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Create geospatial index for location queries
chargingStationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ChargingStation', chargingStationSchema);





