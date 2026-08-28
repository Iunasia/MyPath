const express = require('express');
const router = express.Router();
const Major = require('../models/Major');

router.get('/', async (req, res) => {
  const majors = await Major.find();
  res.render('majors', { title: 'Major Explorer', majors });
});

module.exports = router;