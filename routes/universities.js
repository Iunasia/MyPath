const express = require('express');
const router = express.Router();
const University = require('../models/University');

router.get('/', async (req, res) => {
  const universities = await University.find();
  res.render('universities', { title: 'University Explorer', universities });
});

module.exports = router;