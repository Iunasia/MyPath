require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

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