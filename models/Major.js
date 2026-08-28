const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  field: { type: String, required: true },
  description: { type: String, required: true },
  duration: String,
  degreeType: String,
  relatedCareers: [String]
});

module.exports = mongoose.model('Major', majorSchema);