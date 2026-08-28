const pool = require('../config/db');

const University = {
  getAll: async () => {
    const res = await pool.query('SELECT * FROM universities ORDER BY name ASC');
    return res.rows;
  },

  getById: async (id) => {
    const res = await pool.query('SELECT * FROM universities WHERE id = $1', [id]);
    return res.rows[0];
  },

  create: async (data) => {
    const res = await pool.query(
      `INSERT INTO universities (name, country, city, ranking, description, website, tuition_range, acceptance_rate, programs, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [data.name, data.country, data.city, data.ranking, data.description, data.website, data.tuition_range, data.acceptance_rate, data.programs, data.source, data.source_url]
    );
    return res.rows[0];
  }
};

module.exports = University;