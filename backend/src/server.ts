import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import passport from './config/passport';

const { authLimiter } = require('../middleware/security');
const authRoutes = require('./routes/auth');
const pagesRoutes = require('./routes/pages');
const scholarshipsRoutes = require('./routes/scholarships');
const careersRoutes = require('./routes/careers');
const majorsRoutes = require('./routes/majors');
const universitiesRoutes = require('./routes/universities');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'mypath-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', pagesRoutes);
app.use('/auth', authLimiter, authRoutes);
app.use('/scholarships', scholarshipsRoutes);
app.use('/careers', careersRoutes);
app.use('/majors', majorsRoutes);
app.use('/universities', universitiesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
