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

// Verify OTP
export const verifyOtp = async (req, res, next) => {
  try {
    const { loginSessionId, otp } = req.body

    if (!mongoose.Types.ObjectId.isValid(loginSessionId)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid login session",
      })
    }

    const session = await Otp.findById(loginSessionId).populate("user")
    if (!session || session.status !== "PENDING") {
      return res.status(400).json({
        status: "failed",
        message: "OTP session invalid or expired",
      })
    }

    if (session.expiresAt < new Date()) {
      session.status = "EXPIRED"
      await session.save()
      return res.status(400).json({
        status: "failed",
        message: "OTP expired",
      })
    }

    if (session.code !== otp) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid OTP",
      })
    }

    session.status = "USED"
    await session.save()

    const accessToken = generateAccessToken({ 
      sub: session.user._id,
      role: session.user.role,
    })
    const refreshToken = generateRefreshToken({ sub: session.user._id })
    const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Store refresh token in DB
    await RefreshToken.create({
      user: session.user._id,
      token: refreshToken,
      expiresAt: refreshExpires,
    })

    // Set httpOnly cookie for refresh token
    res.cookie("refreshLoginToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: refreshExpires,
    })

    // Return only access token + user
    return res.status(200).json({
      status: "success",
      accessToken,
      user: session.user,
    })
  } catch (error) {
    next(error)
  }
}


// Register User
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

// Login User
export const loginUser = async (req, res, next) => {
  try {
    const { emailAddress, password, verificationSessionId } = req.validatedData;

    if (!mongoose.Types.ObjectId.isValid(verificationSessionId)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid verification session",
      });
    }

    const verificationSession = await IdentityVerificationSession.findById(
      verificationSessionId
    );

    if (
      !verificationSession ||
      verificationSession.status !== "VERIFIED" ||
      verificationSession.expiresAt < new Date()
    ) {
      return res.status(400).json({
        status: "failed",
        message: "Identity verification expired or invalid",
      });
    }

    const user = await User.findOne({ emailAddress });
    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "Incorrect username/password",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "failed",
        message: "Incorrect username/password",
      });
    }

    const otpCode = generateRandomCode(3); // 6 hex chars

    const otp = await Otp.create({
      user: user._id,
      purpose: "LOGIN",
      code: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const html = `
      <h1>Malawi Immigration</h1>
      <p>Your login verification code is:</p>
      <h2>${otpCode}</h2>
      <p>This code expires in 5 minutes.</p>
    `;
    await sendEmail(user.emailAddress, "Login Verification", html);

    return res.status(200).json({
      status: "success",
      loginSessionId: otp._id,
      message: `OTP sent to ${maskEmail(user.emailAddress)}`,
      otp: otpCode, 
    });
  } catch (error) {
    next(error);
  }
};


// Logout User
export const logoutUser = async (req, res, next) => {
  try {
    const refreshTokenCookie = req.cookies.refreshLoginToken
    if (!refreshTokenCookie) {
       console.log('No refresh token cookie found')
      return res.status(204).json(
        { 
          status: 'failed',
          message: 'No cookie sent'
        })
    }

    await RefreshToken.findOneAndUpdate(
      { token: refreshTokenCookie },
      { revoked: true }
    )

    res.clearCookie("refreshLoginToken")
    return res.status(200).json({ status: "success" })
  } catch (error) {
    next(error)
  }
}

// Refresh Token
export const refreshToken = async (req, res, next) => {
  try {
    const refreshTokenCookie = req.cookies.refreshLoginToken
    if (!refreshTokenCookie) {
      return res.status(401).json({ status: "failed", message: "Missing refresh token" })
    }

    const decoded = verifyRefreshToken(refreshTokenCookie)
    if (!decoded?.sub) {
      return res.status(401).json({ status: "failed", message: "Invalid refresh token" })
    }

    const storedToken = await RefreshToken.findOne({
      token: refreshTokenCookie,
      revoked: false,
      expiresAt: { $gt: new Date() },
    })

    if (!storedToken) {
      return res.status(401).json({ status: "failed", message: "Refresh token revoked or expired" })
    }

    const newRefreshToken = generateRefreshToken({ sub: decoded.sub })
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    storedToken.revoked = true
    storedToken.replacedByToken = newRefreshToken
    await storedToken.save()

    await RefreshToken.create({
      user: decoded.sub,
      token: newRefreshToken,
      expiresAt,
    })

    const accessToken = generateAccessToken({ sub: decoded.sub })

    res.cookie("refreshLoginToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", 
      expires: expiresAt,
    })

    return res.status(200).json({
      status: "success",
      accessToken, 
    })
  } catch (error) {
    next(error)
  }
}


// Request Password Reset
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

