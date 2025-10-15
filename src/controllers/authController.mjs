import User from "../models/User.mjs"
import Nrb from "../models/Nrb.mjs"
import Otp from "../models/Otp.mjs"
import {sendEmail}  from "../utils/sendEmail.mjs"
import {sendSms} from "../utils/smsSender.mjs"
import { generateAccessToken, 
         generateRefreshToken,
         verifyAccessToken } from "../utils/jwt.mjs"
import {generateRandomCode, 
        hashPassword,
        comparePassword,
        maskEmail 
        } from "../utils/helpers.mjs"
import { EventEmitterAsyncResource } from "events"


//veryfy nationalID
export const verfyNationalId = async (req,res, next)=> {
    try {
        const {phone,emailAdress,nationalId} = req.body
        const findCitizen =  await Nrb.findOne({nationalId: nationalId})
        if(!findCitizen){
            return res.status(404).json({
                status: "failed", 
                message: "User not found"})
        }

        //generated the verification otp
        const generatedOTP = generateRandomCode()

        //preparing otp details to be saved in otp collection
        const saveOTPDetails = new Otp({
            nationalId: findCitizen._id,
            email: emailAdress,
            otp: generatedOTP,
            phone:phone
        })
        if (!saveOTPDetails){
            return res.status(500).json({
            status: "failed",
            message: "Internal server error.Validatiton failed"
          })
        }

        //saving otp details
        const savedCitizenOTP = saveOTPDetails.save()
        if(!savedCitizenOTP){
          return res.status(400).json({
            status: "failed",
            message: "saving otp details failed"
          })
        }

        // preparing and sending the otp through email with nodemailer
        const html = `<p> verification otp ${generatedOTP}</p>`
        const subject = "Malawi Immigration"
        const sendCitizenOTP = await sendEmail(findCitizen.email,subject,html)
        if(!sendCitizenOTP){
            return res.status(400).json({
                status: "failed",
                message: "sending email failed"}) 
        }
        
        return res.status(200).json({
            status: "success",
            message:findCitizen._id})
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
        const {nationalId,password,emailAdress,residentialAddress} = req.validatedData
        const hashedPassword = await hashPassword(password)
        console.log(`hashedpassword ${hashedPassword}`)
        const findUserOTP = await Otp.findOne({nationalId})
        const findCitezen =  await Nrb.findById(findUserOTP.nationalId)
        if(!findCitezen || !findUserOTP.otp){
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

        if(!saveCitizen){
            return res.status(400).json({
                status:"failed",
                message:"citizen validation failed"
            }) 
        }


        const savedCitizen = await saveCitizen.save()
        if (!savedCitizen){
              return res.status(400).json({
                status:"failed",
                message: "citizen was not saved in db"
            })   
        }

         return res.status(200).json({
            status:"success",
            message: "saved to db succesfully"})
    } catch (error) {
        next(error)
        
    }
}
// logic to logout user
export const loginUser = async (req,res, next)=> {

    try {
        const {emailAddress,password} = req.validatedData
        if (!password || !emailAddress){
            return res.status(400).json({
                status: "failed",
                message: "Bad request .Missing emailAddress/password"})
        }

        const findCitizen = await User.findOne({emailAddress: emailAddress})
        const comparedPassword = await comparePassword(password, findCitizen.password)
        if(!comparedPassword || !findCitizen){
            return res.status(400).json({
                status: "failed", 
                message: "incorrect username/password"})
        }

        // user assigned a jwt session token
        const loginSessionToken = generateAccessToken(findCitizen)

        // user assigned a refresh jwt token
        const refreshLoginToken = generateRefreshToken(findCitizen)

        return res.status(200).json({
            status: "success",
            message: {
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
            return res.status(400).json({
                status: "failed", 
                message: {
                    message:"you need to be logged in",
                    redirectUrl:"/login"
                }
            })
        }
        
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
        const {userId} = req.body.userId
        const refreshToken = generateRefreshToken(userId)
        if(!refreshToken){
            return res.status(400).json({
                status: "failed",
                message: "Server internal error"
            })
        }

        return res.status(200).json({
            status: "success",
            message: {
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
        const html = `<p>you requested to change the password here is the otp ${otp} </p>`
        const subject = "Immigration Request for Password Reset"
        
        const passwordResetRequest = sendEmail(email,subject,html)
        if(!passwordResetRequest){
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
        const maskedEmail = maskEmail(email)
        return res.status(200).json({
            status: "success",
            message: `password reset request sent to your email address ${maskedEmail}`
        })

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
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
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
        if(!user || !(comparePassword(currentPassword,user.password)) || !(comparePassword(confirmNewPassword,changePasswordHashed))){
            return res.status(500).json({
            status: "failed",
            message: "mismatching passwords"
            })
        }
        const updateUser = await User.findByIdAndUpdate(userID,{$set:{password: changePasswordHashed }, new: true})
        if(!updateUser){
            return res.status(500).json({
            status: "failed",
            message: "failed to reset their password in user db"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "password updated successfully"
            })
        
    } catch (error) {
        next(error)    
    }

}
