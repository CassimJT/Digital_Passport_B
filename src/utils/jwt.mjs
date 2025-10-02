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
  
};

/**
 * Generate Refresh Token for a user
 * @param {Object} user - Object with _id, email, role
 * @returns {String} token
 */ 
export const generateRefreshToken = (user) => {
  return jwt.sign(
    
  );
};

/**
 * Verify Access Token
 * @param {String} token
 * @returns {Object|null}
 */
export const verifyAccessToken = (token) => {
  
};

/**
 * Verify Refresh Token
 * @param {String} token
 * @returns {Object|null}
 */
export const verifyRefreshToken = (token) => {
  
};
