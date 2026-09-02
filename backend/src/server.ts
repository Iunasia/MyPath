import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import path from 'path';

const authRoutes = require('./routes/auth');
const pagesRoutes = require('./routes/pages');
const scholarshipsRoutes = require('./routes/scholarships');
const careersRoutes = require('./routes/careers');
const majorsRoutes = require('./routes/majors');
const universitiesRoutes = require('./routes/universities');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'mypath-secret',
  resave: false,
  saveUninitialized: false,
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', pagesRoutes);
app.use('/auth', authRoutes);
app.use('/scholarships', scholarshipsRoutes);
app.use('/careers', careersRoutes);
app.use('/majors', majorsRoutes);
app.use('/universities', universitiesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
