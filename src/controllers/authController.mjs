import User from "../models/User.mjs"
import Nrb from "../models/Nrb.mjs"
import Otp from "../models/Otp.mjs"
import { sendEmail } from "../utils/sendEmail.mjs"
import { generateAccessToken, generateRefreshToken,verifyAccessToken } from "../utils/jwt.mjs"
import {generateRandomCode, 
        hashPassword,
        comparePassword 
    } from "../utils/helpers.mjs"
import { EventEmitterAsyncResource } from "events"


//veryfy nationalID
export const verfyNationalId = async (req,res, next)=> {
    try {
        const {nationalId,emailAdress,phone} = req.body
        const findCitizen =  await Nrb.findOne({nationalId: nationalId})
        if(!findCitizen){
            return res.status(404).json({status: "failed"})
        }

        const generatedOTP = generateRandomCode()
        const saveOTPDetails = new Otp({
            citizenId: findCitizen._id,
            email: emailAdress,
            otp: generatedOTP,
            phone:phone
        })

        const savedUserOTP = saveOTPDetails.save()

        if(!savedUserOTP){
          return res.status(400).json({status: "saving otp details failed"})
        }
        const sendUserOTP = sendEmail(phone,generatedOTP,generatedOTP)
        if(!sendUserOTP){
            return res.status(400).json({status: "sending email failed"}) 
        }
        return res.status(200).json({data:findCitizen._id})
    } catch (error) {
        next(error)
    }
    
}
//Verify OPT
export const verifyOTP =  async (req,res)=> {
    try {
        const{nationalId,phone, email, otp} = req.body
        const verifiedOTP = await Otp.findOne({
            nationalId:nationalId,
            otp: otp,
            phone:phone,
            email:email
            }    
        )
        if(!verifiedOTP){
            return res.status(400).json({status:"failed"})
        }
        
        return res.status(200).json({status: "success"})

    } catch (error) {
        next(error)
    }
    
}

//logic to regester user

export const registerUser = async (req,res, next)=> {
    try {
        const data = req.validatedData
        const hashedPassword = await hashPassword(data.password)
        console.log(`hashedpassword ${hashedPassword}`)
        const findUserOTP = await Otp.findOne({nationalId:data._id})
        const findCitezen =  await Nrb.findOne({nationalId:data.nationalId})
        if(!findCitezen || !findUserOTP.otp){
            return res.status(400).json({status:"otp or validated failed"}) //
        }

        const user = new User({
            residentialAddress: data.residentialAddress,
            nationalId: data.nationalId,
            password: hashedPassword
        })

        const saveApplicant = await user.save()
        if (!saveApplicant){
              return res.status(400).json({status:"failed"})   
        }
        console.log(`applicant ${data.nationalId} saved to db succesfully`)

         return res.status(200).json({status:"success"})
    } catch (error) {
        next(error)
        
    }
}
// logic to logout user
export const loginUser = async (req,res, next)=> {

    try {
        const loginCredentials = req.validatedData
        if (!loginCredentials || !loginCredentials.password || !loginCredentials.nationalId){
            return res.status(400).json({status: "Bad request"})
        }

        const findCitizen = await User.findOne({nationalId: loginCredentials.nationalId})
        const comparedPassword = await comparePassword(loginCredentials.password, findCitizen.password)
        if(!comparedPassword || ! findCitizen){
            return res.status(400).json({status: "incorrect username/password"})
        }

        // user assigned a jwt session token
        const loginSessionToken = generateAccessToken(findCitizen)

        return res.status(200).json({
            status: "success",
            data: {
                token: loginSessionToken,
                userId: findCitizen._id,
                redirectURL: "/dashboard" // to be replace by a real url
            }
        })
    } catch (error) {
        next(error)
    }

}
//logic to logout user
export const logoutUser = async (req,res,next)=> {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);
        if (!decoded && !authHeader && !(authHeader.startsWith('Bearer '))) {
            return res.status(400).json({status: "you need to be logged in"})
        }
        console.log(`User ${req.body.user} logged out successfully`);
        return res.status(200).json({
            status: 'success',
            data: {
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
        const refreshToken = generateRefreshToken(userId)
        if(!refreshToken){
            console.log("invalid use id")
        }
        return res.status(200).json({
            status: "success",
            data: {
                token: refreshToken,
                userID: userId
            }

        })
    } catch (error) {
        next(error)
    }

}
//logic to reguest reset passwprd
export const requestPasswordReset = async (req,res, next)=> {
    try {
        const {email} = req.validatedData
        const otp = generateRandomCode()
        const passwordResetRequest = sendEmail(email,`you requested to change the password here is the otp ${otp}`)
        if(!passwordResetRequest){
            console.log(`failed to send a resetpasswordrequest email to ${email}`)
        }
        console.lo(`sent an email to ${email} requesting to reset password`)
    } catch (error) {
        next(next)
        
    }

}
//logic to reset password
export const resetPassword = async (req,res,next)=> {
    try {
        const userID = req.user._id
        const {password} = req.validatedData
        const resetHashedPassword = hashPassword(password)
        const updateUser = await User.findByIdAndUpdate(userID,{$set:{password: resetHashedPassword }, new: true})
        if(!updateUser){
            console.log(`user ${userID} failed to reset their password`)
        }
        console.log(`user ${userID}  resetted their password successfully`)
    } catch (error) {
        next(error)    
    }
}
//logic to change passwod
export const changePassword = async (req,res)=> {
    try {
        const userID = req.user._id
        const { currentPassword, newPassword, confirmNewPassword} = req.validatedData
        const user = await User.findOne(userID)
        const changePasswordHashed = hashPassword(newPassword)
        if(!user || !(comparePassword(currentPassword,user,password)) || !(comparePassword(confirmNewPassword,changePasswordHashed))){
            console.log(`user ${userID} failed to change their password , mismatching fields`)
        }
        const updateUser = await User.findByIdAndUpdate(userID,{$set:{password: changePasswordHashed }, new: true})
        if(!updateUser){
            console.log(`user ${userID} failed to reset their password in user db`)
        }
        console.log(`user ${userID}  resetted their password successfully`)
    } catch (error) {
        next(error)    
    }

}
