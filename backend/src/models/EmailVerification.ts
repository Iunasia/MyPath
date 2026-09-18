import pool from '../config/db';
import crypto from 'crypto';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const EmailVerification = {
  create: async (userId: number, code: string, uuidToken?: string): Promise<void> => {
    // Delete any existing codes for this user first
    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [userId]);
    
    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const hashedCode = hashToken(code);
    
    if (uuidToken) {
      const hashedUuid = hashToken(uuidToken);
      await pool.query(
        'INSERT INTO email_verifications (user_id, code, expires_at) VALUES ($1, $2, $3), ($1, $4, $3)',
        [userId, hashedCode, expiresAt, hashedUuid]
      );
    } else {
      await pool.query(
        'INSERT INTO email_verifications (user_id, code, expires_at) VALUES ($1, $2, $3)',
        [userId, hashedCode, expiresAt]
      );
    }
  },

  findValidCode: async (userId: number, code: string): Promise<boolean> => {
    const hashedCode = hashToken(code);
    const res = await pool.query(
      'SELECT * FROM email_verifications WHERE user_id = $1 AND code = $2 AND expires_at > NOW()',
      [userId, hashedCode]
    );
    return res.rows.length > 0;
  },

  findByToken: async (token: string): Promise<number | null> => {
    const hashedToken = hashToken(token);
    const res = await pool.query(
      'SELECT user_id FROM email_verifications WHERE code = $1 AND expires_at > NOW()',
      [hashedToken]
    );
    return res.rows.length > 0 ? res.rows[0].user_id : null;
  },

  deleteByUserId: async (userId: number): Promise<void> => {
    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [userId]);
  }
};

export default EmailVerification;   