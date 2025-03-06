import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader ? authorizationHeader.split(' ')[1] : '';
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Access denied, invalid token' });
  }
};

export default verifyAuthToken;
