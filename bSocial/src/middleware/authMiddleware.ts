import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../customTypes';

export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.path === '/login' || req.path === '/register') {
    next();
  } else {

  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    try {
      const decoded = jwt.verify(token, 'your_secret_key') as { user: any };
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}
};



