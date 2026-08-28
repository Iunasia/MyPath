const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  averageSalary: String,
  growthOutlook: String,
  requiredSkills: [String],
  relatedMajors: [String]
});

module.exports = mongoose.model('Career', careerSchema);