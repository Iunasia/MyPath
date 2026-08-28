const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  ranking: String,
  description: String,
  website: String,
  tuitionRange: String
});

module.exports = mongoose.model('University', universitySchema);