const express = require('express');
const router = express.Router();
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const { generateInfoCheck } = require('../utils/infoCheck');

router.get('/', async (req, res) => {
  const scholarships = await Scholarship.find();
  const scholarshipsWithCheck = scholarships.map(s => ({
    ...s.toObject(),
    infoCheck: generateInfoCheck(s)
  }));
  res.render('scholarships', { title: 'Scholarship Explorer', scholarships: scholarshipsWithCheck });
});

router.get('/:id', async (req, res) => {
  const scholarship = await Scholarship.findById(req.params.id);
  if (!scholarship) return res.status(404).send('Not Found');
  const infoCheck = generateInfoCheck(scholarship);
  res.render('scholarship-detail', { title: scholarship.title, scholarship, infoCheck });
});

router.post('/:id/save', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user.savedOpportunities.includes(req.params.id)) {
    user.savedOpportunities.push(req.params.id);
    await user.save();
  }
  res.redirect('/dashboard');
});

module.exports = router;