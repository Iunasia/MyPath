const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isGuest } = require('../middleware/auth');

router.get('/register', isGuest, (req, res) => res.render('register', { title: 'Register', error: null }));

router.post('/register', isGuest, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role: role || 'student' });
    await user.save();
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userRole = user.role;
    res.redirect('/dashboard');
  } catch (err) {
    res.render('register', { title: 'Register', error: 'Email already registered or error occurred.' });
  }
});

router.get('/login', isGuest, (req, res) => res.render('login', { title: 'Login', error: null }));

router.post('/login', isGuest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { title: 'Login', error: 'Invalid email or password' });
    }
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userRole = user.role;
    res.redirect('/dashboard');
  } catch (err) {
    res.render('login', { title: 'Login', error: 'Login error.' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;