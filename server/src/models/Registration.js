const mongoose = require('mongoose');

const registrationSchema = mongoose.Schema({
  competition: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Competition',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['registered', 'submitted'],
    default: 'registered'
  }
}, {
  timestamps: true,
});

// Ensure a user can only register once for a specific competition
registrationSchema.index({ competition: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
