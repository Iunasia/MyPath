import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

/**
 * Admin-only guard. Answers JSON like every other endpoint — the old version
 * redirected to `/login`, a page that does not exist in this API.
 *
 * Roles are only ever granted server-side (registration always creates a
 * student), so this is the real authorisation boundary. The frontend's
 * RequireAdmin is a convenience wrapper, not a substitute.
 */
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;

  if (!session?.userId) {
    return res.status(401).json({ error: 'Unauthorized: Please log in.' });
  }

  const user = await User.findById(session.userId);
  if (user?.role === 'admin') return next();

  return res.status(403).json({ error: 'Forbidden: administrators only.' });
};

export { isAdmin };
export default isAdmin;
