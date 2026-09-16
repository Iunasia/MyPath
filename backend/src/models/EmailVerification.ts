import pool from '../config/db';

const EmailVerification = {
  create: async (userId: number, code: string): Promise<void> => {
    // Delete any existing codes for this user first
    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [userId]);
    
    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    await pool.query(
      'INSERT INTO email_verifications (user_id, code, expires_at) VALUES ($1, $2, $3)',
      [userId, code, expiresAt]
    );
  },

  findValidCode: async (userId: number, code: string): Promise<boolean> => {
    const res = await pool.query(
      'SELECT * FROM email_verifications WHERE user_id = $1 AND code = $2 AND expires_at > NOW()',
      [userId, code]
    );
    return res.rows.length > 0;
  },

  deleteByUserId: async (userId: number): Promise<void> => {
    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [userId]);
  }
};

export default EmailVerification;   