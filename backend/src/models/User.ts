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
  avatar_data: Buffer | null;
  avatar_mime: string | null;
  avatar_updated_at: Date | null;
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

const User = {
  findByEmail: async (email: string): Promise<User | undefined> => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0] as User | undefined;
  },

  findById: async (id: number): Promise<SafeUser | undefined> => {
    const res = await pool.query(
      'SELECT id, name, email, role, auth_provider, google_id, avatar_url, avatar_updated_at, created_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] as SafeUser | undefined;
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
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, auth_provider, google_id, avatar_url, avatar_updated_at',
      [name, email, hashedPassword, role]
    );
    return res.rows[0] as SafeUser;
  },

  createOAuthUser: async ({ name, email, googleId, avatarUrl }: CreateOAuthUserInput): Promise<SafeUser> => {
    const res = await pool.query(
      `INSERT INTO users (name, email, google_id, avatar_url, auth_provider)
       VALUES ($1, $2, $3, $4, 'google')
       RETURNING id, name, email, role, auth_provider, google_id, avatar_url, avatar_updated_at`,
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

  comparePassword: async (inputPassword: string, storedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(inputPassword, storedPassword);
  },

  updateName: async (id: number, name: string): Promise<SafeUser | undefined> => {
    const res = await pool.query(
      `UPDATE users SET name = $1 WHERE id = $2
       RETURNING id, name, email, role, auth_provider, google_id, avatar_url, avatar_updated_at, created_at`,
      [name, id]
    );
    return res.rows[0] as SafeUser | undefined;
  },

  updateAvatar: async (id: number, data: Buffer, mime: string): Promise<SafeUser | undefined> => {
    const res = await pool.query(
      `UPDATE users SET avatar_data = $1, avatar_mime = $2, avatar_updated_at = NOW() WHERE id = $3
       RETURNING id, name, email, role, auth_provider, google_id, avatar_url, avatar_updated_at, created_at`,
      [data, mime, id]
    );
    return res.rows[0] as SafeUser | undefined;
  },

  removeAvatar: async (id: number): Promise<SafeUser | undefined> => {
    const res = await pool.query(
      `UPDATE users SET avatar_data = NULL, avatar_mime = NULL, avatar_updated_at = NOW() WHERE id = $1
       RETURNING id, name, email, role, auth_provider, google_id, avatar_url, avatar_updated_at, created_at`,
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
