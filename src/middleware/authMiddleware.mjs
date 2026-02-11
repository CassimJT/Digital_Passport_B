import { verifyAccessToken } from "../utils/jwt.mjs"
import User from "../models/User.mjs"

export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyAccessToken(token)

    const user = await User.findById(decoded.sub).select("-password")
    if (!user) {
      return res.status(401).json({ message: "Invalid token" })
    }

    req.user = { id: user._id, role: user.role }
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}
