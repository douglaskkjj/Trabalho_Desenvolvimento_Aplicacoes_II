const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  space_id: {
    type: Number,
    required: true
  },
  user_id: {
    type: Number,
    required: true
  },
  start_datetime: {
    type: Date,
    required: true
  },
  end_datetime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  },
  rejection_reason: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);