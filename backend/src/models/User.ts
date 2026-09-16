import pool from '../config/db';
import bcrypt from 'bcryptjs';

interface User {
  id: number;
  name: string;
  email: string;
  password: string | null;
  role: string;
  auth_provider: string;
  google_id: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  avatar_data: Buffer | null;
  avatar_mime: string | null;
  avatar_updated_at: Date | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  date_of_birth: string | null;
  gender: string | null;
  created_at: Date;
}

type SafeUser = Omit<User, 'password' | 'avatar_data' | 'avatar_mime'>;

interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

interface CreateOAuthUserInput {
  name: string;
  email: string;
  googleId: string;
  avatarUrl?: string;
}

interface UpdateProfileInput {
  name: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

const SAFE_COLUMNS = `id, name, email, role, auth_provider, google_id, avatar_url, avatar_updated_at,
  is_verified, bio, location, website, date_of_birth, gender, created_at`;

const User = {
  findByEmail: async (email: string): Promise<User | undefined> => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0] as User | undefined;
  },

  findById: async (id: number): Promise<SafeUser | undefined> => {
    const res = await pool.query(`SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`, [id]);
    return res.rows[0] as SafeUser | undefined;
  },

  /**
   * Like findByEmail, but by id — used only for internal auth checks (e.g.
   * verifying the current password before a password change). Includes the
   * password hash, so its result must never reach a response body.
   */
  findAuthById: async (id: number): Promise<User | undefined> => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] as User | undefined;
  },

  findByGoogleId: async (googleId: string): Promise<User | undefined> => {
    const res = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return res.rows[0] as User | undefined;
  },

  create: async ({ name, email, password, role = 'student' }: CreateUserInput): Promise<SafeUser> => {
    let hashedPassword: string | null = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }
    const res = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)
       RETURNING ${SAFE_COLUMNS}`,
      [name, email, hashedPassword, role]
    );
    return res.rows[0] as SafeUser;
  },

  createOAuthUser: async ({ name, email, googleId, avatarUrl }: CreateOAuthUserInput): Promise<SafeUser> => {
    const res = await pool.query(
      `INSERT INTO users (name, email, google_id, avatar_url, auth_provider, is_verified)
       VALUES ($1, $2, $3, $4, 'google', FALSE)
       RETURNING ${SAFE_COLUMNS}`,
      [name, email, googleId, avatarUrl || null]
    );
    return res.rows[0] as SafeUser;
  },

  linkGoogleId: async (userId: number, googleId: string): Promise<void> => {
    await pool.query(
      'UPDATE users SET google_id = $1, auth_provider = CASE WHEN auth_provider = \'local\' THEN \'local\' ELSE auth_provider END WHERE id = $2',
      [googleId, userId]
    );
  },

  // ✅ ADDED THIS METHOD
  markAsVerified: async (userId: number): Promise<void> => {
    await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId]);
  },

  comparePassword: async (inputPassword: string, storedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(inputPassword, storedPassword);
  },

  updateProfile: async (id: number, fields: UpdateProfileInput): Promise<SafeUser | undefined> => {
    const res = await pool.query(
      `UPDATE users SET name = $1, bio = $2, location = $3, website = $4, date_of_birth = $5, gender = $6
       WHERE id = $7
       RETURNING ${SAFE_COLUMNS}`,
      [
        fields.name,
        fields.bio,
        fields.location,
        fields.website,
        fields.date_of_birth,
        fields.gender,
        id,
      ]
    );
    return res.rows[0] as SafeUser | undefined;
  },

  updatePassword: async (id: number, hashedPassword: string): Promise<void> => {
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
  },

  updateAvatar: async (id: number, data: Buffer, mime: string): Promise<SafeUser | undefined> => {
    const res = await pool.query(
      `UPDATE users SET avatar_data = $1, avatar_mime = $2, avatar_updated_at = NOW() WHERE id = $3
       RETURNING ${SAFE_COLUMNS}`,
      [data, mime, id]
    );
    return res.rows[0] as SafeUser | undefined;
  },

  removeAvatar: async (id: number): Promise<SafeUser | undefined> => {
    const res = await pool.query(
      `UPDATE users SET avatar_data = NULL, avatar_mime = NULL, avatar_updated_at = NOW() WHERE id = $1
       RETURNING ${SAFE_COLUMNS}`,
      [id]
    );
    return res.rows[0] as SafeUser | undefined;
  },

  getAvatarById: async (
    id: number
  ): Promise<{ avatar_data: Buffer; avatar_mime: string; avatar_updated_at: Date } | undefined> => {
    const res = await pool.query(
      'SELECT avatar_data, avatar_mime, avatar_updated_at FROM users WHERE id = $1 AND avatar_data IS NOT NULL',
      [id]
    );
    return res.rows[0];
  },
};

export default User;