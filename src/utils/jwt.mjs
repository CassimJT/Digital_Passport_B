import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { v4 as uuidv4 } from "uuid"

dotenv.config()

const {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRATION,
} = process.env

// ---------------- ACCESS TOKEN ----------------
export const generateAccessToken = payload => {
  return jwt.sign(
    {
      sub: payload.sub,
      role: payload.role,
    },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRATION || "15m" }
  )
}

export const verifyAccessToken = token => {
  return jwt.verify(token, JWT_ACCESS_SECRET)
}

// ---------------- REFRESH TOKEN ----------------
export const generateRefreshToken = payload => {
  return jwt.sign(
    {
      sub: payload.sub,
      jti: uuidv4(),
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRATION || "1d" }
  )
}

export const verifyRefreshToken = token => {
  return jwt.verify(token, JWT_REFRESH_SECRET)
}
