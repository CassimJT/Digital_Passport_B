import User from "../models/User.mjs"
import Nrb from "../models/Nrb.mjs"
import Otp from "../models/Otp.mjs"
import sendEmail from "../utils/sendEmail.mjs"
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.mjs"
import {
  generateRandomCode,
  hashPassword,
  comparePassword,
  maskEmail,
} from "../utils/helpers.mjs"
import IdentityVerificationSession from "../models/IdentityVerificationSession.mjs"
import RefreshToken from "../models/RefreshToken.mjs"
import mongoose from "mongoose"

/* ============================
   VERIFY OTP
============================ */
export const verifyOTP = async (req, res, next) => {
  try {
    const { loginSessionId, otp } = req.body

    if (!mongoose.Types.ObjectId.isValid(loginSessionId)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid login session",
      })
    }

    const otpRecord = await Otp.findById(loginSessionId)
    if (
      !otpRecord ||
      otpRecord.status !== "PENDING" ||
      otpRecord.expiresAt < new Date() ||
      otpRecord.code !== otp
    ) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid or expired OTP",
      })
    }

    otpRecord.status = "VERIFIED"
    await otpRecord.save()

    const user = await User.findById(otpRecord.userId)
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      })
    }

    const accessToken = generateAccessToken({
      sub: user._id,
      role: user.role,
      identitySessionId: otpRecord.verificationSession,
    })

    const refreshToken = generateRefreshToken({
      sub: user._id,
    })

    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
    const refreshTokenExpiresAt = new Date(Date.now() + thirtyDaysInMs)

    await RefreshToken.findOneAndUpdate(
      { user: user._id },
      {
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        revoked: false,
      },
      {
        upsert: true,
        new: true,
      }
    )

    res.cookie("refreshLoginToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: refreshTokenExpiresAt,
    })

    return res.status(200).json({
      status: "success",
      accessToken,
      user: {
        id: user._id,
        emailAddress: user.emailAddress,
        role: user.role,
      },
      redirectURL: "/dashboard",
    })
  } catch (error) {
    next(error)
  }
}

/* ============================
   REGISTER USER
============================ */
export const registerUser = async (req, res, next) => {
  try {
    const { verificationSessionId, emailAddress, password, confirmPassword } =
      req.validatedData

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "failed",
        message: "Passwords do not match",
      })
    }

    if (!mongoose.Types.ObjectId.isValid(verificationSessionId)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid verification session",
      })
    }

    const verificationSession = await IdentityVerificationSession.findById(
      verificationSessionId
    )

    if (
      !verificationSession ||
      verificationSession.status !== "VERIFIED" ||
      verificationSession.expiresAt < new Date()
    ) {
      return res.status(400).json({
        status: "failed",
        message: "Identity verification not completed",
      })
    }

    const existingUser = await User.findOne({ emailAddress })
    if (existingUser) {
      return res.status(400).json({
        status: "failed",
        message: "User already exists",
      })
    }

    const hashedPassword = await hashPassword(password)

    const user = await User.create({
      nationalId: verificationSession.citizenId,
      emailAddress,
      password: hashedPassword,
    })

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      userId: user._id,
    })
  } catch (error) {
    next(error)
  }
}

/* ============================
   LOGIN USER (OTP ISSUANCE)
============================ */
export const loginUser = async (req, res, next) => {
  try {
    const { emailAddress, password, verificationSessionId } = req.validatedData

    if (!mongoose.Types.ObjectId.isValid(verificationSessionId)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid verification session",
      })
    }

    const verificationSession = await IdentityVerificationSession.findById(
      verificationSessionId
    )

    if (
      !verificationSession ||
      verificationSession.status !== "VERIFIED" ||
      verificationSession.expiresAt < new Date()
    ) {
      return res.status(400).json({
        status: "failed",
        message: "Identity verification expired or invalid",
      })
    }

    const user = await User.findOne({ emailAddress })
    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "Incorrect username/password",
      })
    }

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "failed",
        message: "Incorrect username/password",
      })
    }

    const otpCode = generateRandomCode()

    const otp = await Otp.create({
      userId: user._id,
      purpose: "LOGIN",
      code: otpCode,
      status: "PENDING",
      verificationSession: verificationSession._id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })

    const html = `
      <h1>Malawi Immigration</h1>
      <p>Your login verification code is:</p>
      <h2>${otpCode}</h2>
      <p>This code expires in 5 minutes.</p>
    `
    await sendEmail(user.emailAddress, "Login Verification", html)

    return res.status(200).json({
      status: "success",
      loginSessionId: otp._id,
      message: `OTP sent to ${maskEmail(user.emailAddress)}`,
    })
  } catch (error) {
    next(error)
  }
}

/* ============================
   LOGOUT USER
============================ */
export const logoutUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const refreshTokenCookie = req.cookies.refreshLoginToken
    const userId = req.body.userId

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid user",
      })
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "failed",
        message: "Missing access token",
      })
    }

    const accessToken = authHeader.split(" ")[1]
    const accessTokenDecoded = verifyAccessToken(accessToken)
    const refreshTokenDecoded = verifyRefreshToken(refreshTokenCookie)

    if (!accessTokenDecoded || !refreshTokenDecoded) {
      return res.status(401).json({
        status: "failed",
        message: {
          message: "You need to be logged in",
          redirectUrl: "/login",
        },
      })
    }

    await RefreshToken.findOneAndUpdate(
      { user: userId },
      { $set: { revoked: true } },
      { new: true }
    )

    return res.status(200).json({
      status: "success",
      message: { redirectUrl: "/login" },
    })
  } catch (error) {
    next(error)
  }
}

/* ============================
   REFRESH TOKEN
============================ */
export const refreshToken = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const refreshTokenCookie = req.cookies.refreshLoginToken
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000

    if (!mongoose.Types.ObjectId.isValid(userId) || !refreshTokenCookie) {
      return res.status(400).json({
        status: "failed",
        message: "Bad request, invalid user or token",
      })
    }

    const refreshTokenDecoded = verifyRefreshToken(refreshTokenCookie)
    if (!refreshTokenDecoded) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid refresh token",
      })
    }

    const newRefreshToken = generateRefreshToken({ sub: userId })

    await RefreshToken.findOneAndUpdate(
      { user: userId },
      {
        token: newRefreshToken,
        revoked: false,
        expiresAt: new Date(Date.now() + thirtyDaysInMs),
      },
      {
        upsert: true,
        new: true,
      }
    )

    res.cookie("refreshLoginToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + thirtyDaysInMs),
      sameSite: "strict",
    })

    return res.status(200).json({
      status: "success",
    })
  } catch (error) {
    next(error)
  }
}

/* ============================
   REQUEST PASSWORD RESET
============================ */
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { emailAddress } = req.validatedData
    const resetPasswordUrl = process.env.RESET_URL

    const findCitizen = await User.findOne({ emailAddress })
    if (!findCitizen) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      })
    }

    const html = `
      <h1>Malawi Immigration</h1>
      <p>You requested to change your password. Click the link below:</p>
      <p>${resetPasswordUrl}</p>
      <p>Please do not share this link with anyone else.</p>
    `
    const subject = "Immigration Request for Password Reset"

    await sendEmail(emailAddress, subject, html)

    return res.status(200).json({
      status: "success",
      message: `Password reset request sent to your email address ${emailAddress}`,
    })
  } catch (error) {
    next(error)
  }
}

//reset password
export const resetPassword = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.query.id)
    const { password, confirmPasword } = req.validatedData

    if (password !== confirmPasword) {
      return res.status(400).json({
        status: "failed",
        message: "Mismatching passwords",
      })
    }

    const resetHashedPassword = await hashPassword(password)
    await User.findByIdAndUpdate(
      userId,
      { password: resetHashedPassword },
      { new: true }
    )

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    })
  } catch (error) {
    next(error)
  }
}

//change password
export const changePassword = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.validatedData.userId)
    const { currentPassword, newPassword, confirmNewPassword } =
      req.validatedData

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      })
    }

    const isCurrentValid = await comparePassword(
      currentPassword,
      user.password
    )
    if (!isCurrentValid || newPassword !== confirmNewPassword) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid current password or mismatched new passwords",
      })
    }

    const changePasswordHashed = await hashPassword(newPassword)
    await User.findByIdAndUpdate(userId, {
      $set: { password: changePasswordHashed },
    })

    return res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    })
  } catch (error) {
    next(error)
  }
}
