const mongoose = require('mongoose');

const competitionSchema = mongoose.Schema({
  title: { type: String, required: true },
  tags: [{ type: String }],
  prizePool: { type: Number, required: true },
  entryFee: { type: Number, required: true },
  capacity: {
    totalSpots: { type: Number, required: true },
    bookedSpots: { type: Number, default: 0 },
  },
  judge: {
    name: { type: String, required: true },
    title: { type: String, required: true },
    experience: { type: String, required: true },
    image: { type: String },
    videoUrl: { type: String }
  },
  dates: {
    registrationClose: { type: Date, required: true },
    submissionStart: { type: Date, required: true },
    submissionEnd: { type: Date, required: true },
    resultDate: { type: Date, required: true }
  },
  previousWinners: [{
    name: { type: String },
    position: { type: String },
    image: { type: String },
    videoUrl: { type: String }
  }],
  tabs: {
    about: { type: String, required: true },
    judgingParameters: { type: String, required: true },
    rules: { type: String, required: true }
  },
  rewards: [{
    position: { type: String },
    amount: { type: Number }
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Competition', competitionSchema);
