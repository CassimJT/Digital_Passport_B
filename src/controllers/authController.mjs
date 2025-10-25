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
import RefreshToken from "../models/RefreshToken.mjs"
import mongoose from "mongoose" 



//veryfy nationalID
export const verfyNationalId = async (req,res, next)=> {
    try {
        const {phone,emailAddress,nationalId} = req.body
        const findCitizen =  await Nrb.findOne({nationalId: nationalId})
        if(!findCitizen){
            return res.status(404).json({
                status: "failed", 
                message: "User not found"})
        }

        //generated the verification otp
        const generatedOTP = generateRandomCode()

        //preparing otp details to be saved in otp collection
        const saveOTPDetails = await Otp.findOneAndUpdate(
            {nationalId: findCitizen._id},
            {email: emailAddress,
             otp: generatedOTP,
             phone
            },
            {
                upsert: true, // creates one if document is not  found
                new: true,
                setDefaultsOnInsert:true
            }
        )
        
        // preparing and sending the otp through email with nodemailer
        const html = `
            <h1>Malawi Immigration<h1/>
            <p> you are verification otp ${generatedOTP}</p>
            <p>please do not share this code with anyone else</p>
        `
        const subject = "Malawi Immigration"
       const emailFeedback = await sendEmail(findCitizen.emailAddress,subject,html)
       console.log(emailFeedback)
        
        return res.status(200).json({
            status: "success",
            body:{
                userId:findCitizen._id,
                emailAddress: findCitizen.emailAddress 
            }})
    } catch (error) {
        next(error)
    }
    
}
//Verify OPT
export const verifyOTP =  async (req,res,next)=> {
    try {
        const{email, otp} = req.body
        const verifiedOTP = await Otp.findOneAndUpdate({email,otp},{$set:{status: "verified" }}, {new: true})
        if(!verifiedOTP){
            return res.status(404).json({
                status:"failed",
                message:" user not found"
            })
        }
        
        return res.status(200).json({
            status: "success",
            message: "ok"
        })

    } catch (error) {
        next(error)
    }
    
}

//logic to regester user

export const registerUser = async (req,res, next)=> {
    try {
        const {nationalId,password,emailAddress,residentialAddress} = req.validatedData
        const hashedPassword = await hashPassword(password)
        const findUserOTP = await Otp.findOne({email: emailAddress})
        const findCitezen =  await Nrb.findById(findUserOTP.nationalId)
        if(!findCitezen || !findUserOTP.status==="verified"){
            return res.status(400).json({
                status:"failed",
                message:"otp or validated failed"
            }) 
        }

        console.log(findUserOTP)
        const saveCitizen = new User({
            residentialAddress: residentialAddress,
            nationalId: findCitezen._id,
            emailAddress: emailAddress,
            password: hashedPassword
        })
        await saveCitizen.save()

         return res.status(200).json({
            status:"success",
            message: "saved user succesfully"})
    } catch (error) {
        next(error)
        
    }
}
// logic to logout user
export const loginUser = async (req,res, next)=> {
    console.log("loggin in")

    try {
        const {emailAddress,password} = req.validatedData
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

        const findCitizen = await User.findOne({emailAddress: emailAddress})
        const comparedPassword = await comparePassword(password, findCitizen.password)
        if(!comparedPassword || !findCitizen){
            return res.status(400).json({
                status: "failed", 
                message: "incorrect username/password"
            })
        }

        /*
        user assigned a jwt session token & refresh jwt token
        */
        const loginSessionToken = generateAccessToken(findCitizen)
        const refreshLoginToken = generateRefreshToken(findCitizen)
        const storeRefreshToken = await RefreshToken.findOneAndUpdate(
            {
                user:findCitizen._id
            },
            {
                token: loginSessionToken,
                expiresAt: thirtyDaysInMs
            },
            {
                upsert:true,
                new: true
            }
        )
         

        res.cookie("refreshLoginToken",refreshLoginToken,{
            httpOnly:true,
           // secure:true, // ---this will be used in deployment
            expires:new Date(Date.now() + thirtyDaysInMs),
            sameSite: 'strict'

        })

        return res.status(200).json({
            status: "success",
            message: {
                token: loginSessionToken,
                userId: storeRefreshToken._id,
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
        const userID = req.user._id
        const {password,confirmPasword} = req.validatedData
        if(password !== confirmPassword){
            return res.status(400).json({
            status: "failed",
            message: "mismatching passwords"
         })
        }
        const resetHashedPassword = hashPassword(password)
        await User.findByIdAndUpdate(userID,{$set:{password: resetHashedPassword }, new: true})
        
         return res.status(200).json({
            status: "success",
            message: "resetted their password successfully"
         })
    } catch (error) {
        next(error)    
    }
}
//logic to change passwod
export const changePassword = async (req,res)=> {
    try {
        const userID = req.body.id
        const { currentPassword, newPassword, confirmNewPassword} = req.validatedData
        const user = await User.findOne(userID)
        const changePasswordHashed = hashPassword(newPassword)
        if(!user || !(comparePassword(currentPassword,user.password)) || 
           !(comparePassword(confirmNewPassword,changePasswordHashed))
        ){
            return res.status(500).json({
            status: "failed",
            message: "mismatching passwords"
            })
        }
        await User.findByIdAndUpdate(userID,{$set:{password: changePasswordHashed }, new: true})
        
        return res.status(200).json({
            status: "success",
            message: "password updated successfully"
            })
        
    } catch (error) {
        next(error)    
    }

}
