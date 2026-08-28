const express = require('express');
const router = express.Router();
const Career = require('../models/Career');

router.get('/', async (req, res) => {
  const careers = await Career.find();
  res.render('careers', { title: 'Career Explorer', careers });
});

module.exports = router;