const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Find user by email (for login)
  findByEmail: async (email) => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const res = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
    return res.rows[0];
  },

  // Create new user (hashes password)
  create: async ({ name, email, password, role = 'student' }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const res = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );
    return res.rows[0];
  },

  // Check password validity
  comparePassword: async (inputPassword, storedPassword) => {
    return await bcrypt.compare(inputPassword, storedPassword);
  }
};

module.exports = User;