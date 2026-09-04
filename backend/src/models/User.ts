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
  created_at: Date;
}

type SafeUser = Omit<User, 'password'>;

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
      'SELECT id, name, email, role, auth_provider, google_id, avatar_url, created_at FROM users WHERE id = $1',
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
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, auth_provider, google_id, avatar_url',
      [name, email, hashedPassword, role]
    );
    return res.rows[0] as SafeUser;
  },

  createOAuthUser: async ({ name, email, googleId, avatarUrl }: CreateOAuthUserInput): Promise<SafeUser> => {
    const res = await pool.query(
      `INSERT INTO users (name, email, google_id, avatar_url, auth_provider)
       VALUES ($1, $2, $3, $4, 'google')
       RETURNING id, name, email, role, auth_provider, google_id, avatar_url`,
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
};

export default User;
