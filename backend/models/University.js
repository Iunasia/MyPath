const pool = require('../config/db');

const Scholarship = {
  // Get all verified scholarships
  getAll: async () => {
    const res = await pool.query('SELECT * FROM scholarships ORDER BY deadline ASC NULLS LAST');
    return res.rows;
  },

  getById: async (id) => {
    const res = await pool.query('SELECT * FROM scholarships WHERE id = $1', [id]);
    return res.rows[0];
  },

  create: async (data) => {
    const res = await pool.query(
      `INSERT INTO scholarships (title, provider, provider_type, description, amount, coverage, eligibility, deadline, application_link, country, source, source_url, source_type, verified_status, safety_warnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [data.title, data.provider, data.provider_type, data.description, data.amount, data.coverage, data.eligibility, data.deadline, data.application_link, data.country, data.source, data.source_url, data.source_type, data.verified_status, data.safety_warnings]
    );
    return res.rows[0];
  },

  // Save opportunity for student
  saveForUser: async (userId, scholarshipId) => {
    const res = await pool.query(
      'INSERT INTO saved_opportunities (user_id, scholarship_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [userId, scholarshipId]
    );
    return res.rows[0];
  },

  // Get all saved opportunities for a student
  getSavedByUser: async (userId) => {
    const res = await pool.query(
      `SELECT s.*, so.saved_at 
       FROM scholarships s
       JOIN saved_opportunities so ON s.id = so.scholarship_id
       WHERE so.user_id = $1
       ORDER BY so.saved_at DESC`,
      [userId]
    );
    return res.rows;
  },

  // Report outdated info
  report: async (userId, scholarshipId, reason) => {
    const res = await pool.query(
      'INSERT INTO reports (user_id, scholarship_id, reason) VALUES ($1, $2, $3) RETURNING *',
      [userId, scholarshipId, reason]
    );
    return res.rows[0];
  }
};

module.exports = Scholarship;