const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  provider: { type: String, required: true },
  description: { type: String, required: true },
  amount: String,
  coverage: String,
  eligibility: [String],
  deadline: Date,
  applicationLink: String,
  country: String,

  // DMIL Information Check Fields
  source: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  sourceType: { type: String, enum: ['official', 'verified', 'social_media', 'unverified'], default: 'official' },
  lastVerified: { type: Date, default: Date.now },
  verifiedStatus: { type: String, enum: ['verified', 'pending', 'flagged'], default: 'verified' },
  safetyWarnings: [String]
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);