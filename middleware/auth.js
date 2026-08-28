const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  res.redirect('/login');
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.userId) return res.redirect('/dashboard');
  next();
};

module.exports = { isAuthenticated, isGuest };