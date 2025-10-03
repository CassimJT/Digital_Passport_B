import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRATION
} = process.env;

/**
 * Generate Access Token for a user
 * @param {Object} user - Object with _id, email, role
 * @returns {String} token
 */
export const generateAccessToken = (user) => {
  const accessPayload = {userID: user.id, userEmail: user.email, userRole: user.role};
  const accessToken = jwt.sign(accessPayload,JWT_ACCESS_SECRET,{expiresIn: JWT_ACCESS_EXPIRATION})
  return (accessToken);
  
};

/**
 * Generate Refresh Token for a user
 * @param {Object} user - Object with _id, email, role
 * @returns {String} token
 */ 
export const generateRefreshToken = (user) => {
  const refreshPayload = {useID: user.id, userEmail: user.email, userRole: user.role}
  const refreshToken = jwt.sign(refreshPayload,JWT_REFRESH_SECRET,{expiresIn:JWT_REFRESH_EXPIRATION})
  return (refreshToken);
};

/**
 * Verify Access Token
 * @param {String} token
 * @returns {Object|null}
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token,JWT_ACCESS_SECRET) ;
  
};

/**
 * Verify Refresh Token
 * @param {String} token
 * @returns {Object|null}
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token,JWT_REFRESH_SECRET)
  
};
