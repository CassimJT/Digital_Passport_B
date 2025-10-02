import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { verifyAccessToken } from '../utils/jwt.mjs';

dotenv.config(); 

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    if(!token) {
      return res.status(403).json({
        message:"Invalide or expered token"
      })
    }
      req.user = decoded; 
      next();
  } else {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }
};