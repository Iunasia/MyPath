import { Request, Response, NextFunction } from 'express';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Cast to any because req.session typing requires @types/express-session
  const session = req.session as any;
  
  if (session && session.userId) return next();
  
  // Changed from redirect to JSON API response
  return res.status(401).json({ error: 'Unauthorized: Please log in to access this page.' });
};

const isGuest = (req: Request, res: Response, next: NextFunction) => {
  // Cast to any because req.session typing requires @types/express-session
  const session = req.session as any;

  if (session && session.userId) {
    // Changed from redirect to JSON API response
    return res.status(403).json({ error: 'Forbidden: You are already logged in.' });
  }
  
  next();
};

export { isAuthenticated, isGuest };