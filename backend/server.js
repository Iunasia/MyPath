require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const { Pool } = require('pg');
const { generalLimiter, sessionCookieConfig } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// --- Security middleware (applies globally, before any routes) ---
app.use(helmet());       // sets secure HTTP headers
app.use(generalLimiter); // basic abuse/scraping protection

app.use(session({
  secret: process.env.SESSION_SECRET, // set this in .env — never hardcode it
  resave: false,
  saveUninitialized: false,
  cookie: sessionCookieConfig
}));

app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');

    res.send('test');
  } catch (error) {
    console.error('PostgreSQL connection error:', error.message);
    res.status(500).send('Database connection failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});