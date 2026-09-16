import { Request, Response, NextFunction } from 'express';

export const getAuthUserId = (req: Request): number | null => {
  const session = req.session as any;
  if (session && session.userId) return Number(session.userId);
  if ((req as any).user && (req as any).user.id) return Number((req as any).user.id);
  if (session?.passport?.user) return Number(session.passport.user);
  return null;
};

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const userId = getAuthUserId(req);
  if (userId) {
    const session = req.session as any;
    if (session && !session.userId) session.userId = userId;
    return next();
  }
  
  // Changed from redirect to JSON API response
  return res.status(401).json({ error: 'Unauthorized: Please log in to access this page.' });
};

const isGuest = (req: Request, res: Response, next: NextFunction) => {
  const userId = getAuthUserId(req);
  if (userId) {
    // Changed from redirect to JSON API response
    return res.status(403).json({ error: 'Forbidden: You are already logged in.' });
  }
  
  next();
};

export { isAuthenticated, isGuest };