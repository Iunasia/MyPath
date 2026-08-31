const pool = require('../config/db');

const Career = {
  getAll: async () => {
    const res = await pool.query('SELECT * FROM careers ORDER BY category ASC, title ASC');
    return res.rows;
  },

  getById: async (id) => {
    const res = await pool.query('SELECT * FROM careers WHERE id = $1', [id]);
    return res.rows[0];
  },

  create: async (data) => {
    const res = await pool.query(
      `INSERT INTO careers (title, category, description, average_salary, growth_outlook, required_skills, related_majors, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.title, data.category, data.description, data.average_salary, data.growth_outlook, data.required_skills, data.related_majors, data.source, data.source_url]
    );
    return res.rows[0];
  }
};

module.exports = Career;