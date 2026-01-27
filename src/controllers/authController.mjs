import User from "../models/User.mjs"
import Nrb from "../models/Nrb.mjs"
import Otp from "../models/Otp.mjs"
import sendEmail  from "../utils/sendEmail.mjs"
import { 
    generateAccessToken, 
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken 
} from "../utils/jwt.mjs"
import {
    generateRandomCode, 
    hashPassword,
    comparePassword,
    maskEmail 
} from "../utils/helpers.mjs"
import IdentityVerificationSession from "../models/IdentityVerificationSession.mjs"
import RefreshToken from "../models/RefreshToken.mjs"
import mongoose from "mongoose" 

//Verify OPT
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

    // Issue tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

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

//logic to regester user

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
// logic to logout user
export const loginUser = async (req, res, next) => {
  try {
    const { emailAddress, password, verificationSessionId } = req.validatedData

    // Validate verification session
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
      verificationSession.status !== "PENDING" ||
      verificationSession.expiresAt < new Date()
    ) {
      return res.status(400).json({
        status: "failed",
        message: "Identity verification expired or invalid",
      })
    }

    // Validate user credentials
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

    // Generate OTP (no tokens yet)
    const otpCode = generateRandomCode()

    const otp = await Otp.create({
      userId: user._id,
      purpose: "LOGIN",
      code: otpCode,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })

    // Send OTP
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
//logic to logout user
export const logoutUser = async (req,res,next)=> {
    try {
        const authHeader = req.headers.authorization;
        console.log(req.cookies.refreshLoginToken)
        const refreshToken = req.cookies.refreshLoginToken
        const userId = req.body.userId
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({
                status: "failed",
                message: "invalid user"
            })
        }
        const tokenId = new mongoose.Types.ObjectId(userId)
        const accessToken = authHeader.split(' ')[1];
        const accessTokenDecoded = verifyAccessToken(accessToken);
        const refreshTokenDecoded = verifyRefreshToken(refreshToken)
        if ((!accessTokenDecoded && !authHeader && !(authHeader.startsWith('Bearer '))) && !refreshTokenDecoded) {
            return res.status(400).json({
                status: "failed", 
                message: {
                    message:"you need to be logged in",
                    redirectUrl:"/login"
                }
            })
        }

        await RefreshToken.findByIdAndUpdate(tokenId,{$set:{revoked: true}})

        return res.status(200).json({
            status: 'success',
            message: {
                redirectUrl: '/login', // Redirect to login page
        }
    }
    )
    } catch (error) {
        next(error)
    }
}
//logic to refresh token
export const refreshToken = async (req,res, next)=> {
    try {
        const userId = req.body.userId
        const tokenId = req.cookies.refreshLoginToken 
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        if(!mongoose.Types.ObjectId.isValid(userId) || !tokenId){
            return res.status(400).json({
                status: "failed",
                message: "Bad request, invalid User"
            })
        }
        const userObjectId = new mongoose.Types.ObjectId(userId)
        const refreshLoginToken = generateRefreshToken(userObjectId)
        if(!refreshLoginToken){
            return res.status(500).json({
                status: "failed",
                message: "Server internal error"
            })
        }
   
        await RefreshToken.findByIdAndUpdate(
                userObjectId,
            {
                token:refreshLoginToken,
                revoked: false
            },
             
            {
                upsert: true,
                new: true
            }
        )

        res.cookie("refreshLoginToken",refreshLoginToken,{
            httpOnly:true,
            // secure:true, //--- this will be used when deployed
            expires:new Date(Date.now() + thirtyDaysInMs),
            sameSite: 'strict'

        })

        return res.status(200).json({
            status: "success",
            message: userObjectId
        })
    } catch (error) {
        next(error)
    }

}
//logic to reguest reset passwprd
export const requestPasswordReset = async (req,res, next)=> {
    console.log("requestPasswordReset")
    try {
        const {emailAddress} = req.validatedData
        const resetPasswordUrl = process.env.RESET_URL
        console.log(emailAddress)
        const findCitizen = await User.findOne({emailAddress})
        if(!findCitizen){
            return res.status(404).json({
                status: "failed",
                message: "User not found"
            })
        }
        const html = `
        <h1>Malawi Immigratiin</h1>
        <p>you requested to change the password.click the link below </p>
        <p>${resetPasswordUrl}</p>
        <p>Please do not share this link with anyone else</p>
        `
        const subject = "Immigration Request for Password Reset"
        
        const passwordRequest = await sendEmail(emailAddress,subject,html)
        console.log(passwordRequest)
        return res.status(200).json({
            status: "success",
            message: `password reset request sent to your email address ${emailAddress}`
        })

    } catch (error) {
        next(next)
        
    }

}
//logic to reset password
export const resetPassword = async (req,res,next)=> {
    try {
        const userId = new mongoose.Types.ObjectId(req.query.id)
        const {password,confirmPasword} = req.validatedData
        if(password !== confirmPasword){
            return res.status(400).json({
            status: "failed",
            message: "mismatching passwords"
         })
        }
        const resetHashedPassword = await hashPassword(password)
        const temp = await User.findByIdAndUpdate(userId,{password: resetHashedPassword }, {new: true})
         return res.status(200).json({
            status: "success",
            message: "resetted their password successfully"
         })
    } catch (error) {
        next(error)    
    }
}
//logic to change passwod
export const changePassword = async (req,res,next)=> {
    try {
        const userId = new mongoose.Types.ObjectId(req.validatedData.userId)
        const {currentPassword, newPassword, confirmNewPassword} = req.validatedData
        const user = await User.findOne(userId)
        const changePasswordHashed = await hashPassword(newPassword)
        if(!user || !(comparePassword(currentPassword,user.password)) || 
           !(comparePassword(confirmNewPassword,changePasswordHashed))
        ){
            return res.status(500).json({
            status: "failed",
            message: "mismatching passwords"
            })
        }
        await User.findByIdAndUpdate(userId,{$set:{password: changePasswordHashed }, new: true})
        
        return res.status(200).json({
            status: "success",
            message: "password updated successfully"
            })
        
    } catch (error) {
        next(error)    
    }

}
