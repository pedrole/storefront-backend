import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
import jwt from 'jsonwebtoken';
import { User } from '../models/user';

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader ? authorizationHeader.split(' ')[1] : '';
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string);
    const user = decoded as { user: User };
    (req as Request).user = user.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Access denied, invalid token' });
  }
};

export default verifyAuthToken;
