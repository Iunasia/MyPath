const express = require('express');
const router = express.Router();
const Scholarship = require('../models/Scholarship');
const University = require('../models/University');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const scholarshipCount = await Scholarship.countDocuments();
  const universityCount = await University.countDocuments();
  res.render('home', { title: 'MyPath — Home', scholarshipCount, universityCount });
});

router.get('/dashboard', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId).populate('savedOpportunities');
  res.render('saved', { title: 'My Dashboard', user, saved: user.savedOpportunities });
});

module.exports = router;