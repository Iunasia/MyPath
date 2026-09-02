import pool from '../config/db';
import bcrypt from 'bcryptjs';

// Define the full shape of the User data
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: Date;
}

// Type for user data returned WITHOUT the password
type SafeUser = Omit<User, 'password'>;

// Type for the create method's input parameters
interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

const User = {
  // Find user by email (for login) - returns full user including password
  findByEmail: async (email: string): Promise<User | undefined> => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0] as User | undefined;
  },

  // Find user by ID - returns safe user without password
  findById: async (id: number): Promise<SafeUser | undefined> => {
    const res = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
    return res.rows[0] as SafeUser | undefined;
  },

  // Create new user (hashes password)
  create: async ({ name, email, password, role = 'student' }: CreateUserInput): Promise<SafeUser> => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const res = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );
    return res.rows[0] as SafeUser;
  },

  // Check password validity
  comparePassword: async (inputPassword: string, storedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(inputPassword, storedPassword);
  }
};

export default User;
