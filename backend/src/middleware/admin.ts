import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // Cast to any because req.session typing requires @types/express-session
  const session = req.session as any;

  if (!session || !session.userId) return res.redirect('/login');

  const user = await User.findById(session.userId);

  if (user && user.role === 'admin') return next();

  res.status(403).send('Access Denied: Admin Only');
};

export default isAdmin;