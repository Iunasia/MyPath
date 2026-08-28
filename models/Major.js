const pool = require('../config/db');

const Major = {
  getAll: async () => {
    const res = await pool.query('SELECT * FROM majors ORDER BY field ASC, name ASC');
    return res.rows;
  },

  getById: async (id) => {
    const res = await pool.query('SELECT * FROM majors WHERE id = $1', [id]);
    return res.rows[0];
  },

  create: async (data) => {
    const res = await pool.query(
      `INSERT INTO majors (name, field, description, duration, degree_type, related_careers, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.name, data.field, data.description, data.duration, data.degree_type, data.related_careers, data.source, data.source_url]
    );
    return res.rows[0];
  }
};

module.exports = Major;