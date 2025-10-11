import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRATION
} = process.env;

const jwtTokenSecret = JWT_ACCESS_SECRET
const jwtAccesExpiration = JWT_ACCESS_EXPIRATION
const jwtRefreshsecret = JWT_REFRESH_SECRET
const jwtRefreshExpiration = JWT_REFRESH_EXPIRATION

/**
 * Generate Access Token for a user
 * @param {Object} user - Object with _id, email, role
 * @returns {String} token
 */
export const generateAccessToken = (user) => {
  const accessPayload = {userID: user._id, userEmail: user.email, userRole: user.role};
  const accessToken = jwt.sign(accessPayload,jwtTokenSecret,{expiresIn: jwtAccesExpiration})
  return (accessToken);
  
};

/**
 * Generate Refresh Token for a user
 * @param {Object} user - Object with _id, email, role
 * @returns {String} token
 */ 
export const generateRefreshToken = (user) => {
  const refreshPayload = {useID: user._id}
  const refreshToken = jwt.sign(refreshPayload,jwtRefreshsecret,{expiresIn:jwtRefreshExpiration})
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
