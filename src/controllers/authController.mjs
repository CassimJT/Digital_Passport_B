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
        const saveOTPDetails = new Otp({
            nationalId: findCitizen._id,
            email: emailAddress,
            otp: generatedOTP,
            phone:phone
        })
       
        //saving otp details
        const savedCitizenOTP = saveOTPDetails.save()
        
        // preparing and sending the otp through email with nodemailer
        const html = `
            <h1>Malawi Immigration<h1/>
            <p> you are verification otp ${generatedOTP}</p>
            <p>please do not share this code with anyone else</p>
        `
        const subject = "Malawi Immigration"
        await sendEmail(findCitizen.email,subject,html)
        
        return res.status(200).json({
            status: "success",
            message:savedCitizenOTP._id})
    } catch (error) {
        next(error)
    }
    
}
//Verify OPT
export const verifyOTP =  async (req,res,next)=> {
    try {
        const{userID, otp} = req.body
        const verifiedOTP = await Otp.findByIdAndUpdate(userID,{$set:{status: "verified" }, new: true})
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
        const findUserOTP = await Otp.findById({nationalId})
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

    try {
        const {emailAddress,password} = req.validatedData
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

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
        const storeRefreshToken = await RefreshToken.findByIdAndUpdate(
                                    refreshLoginToken._id,
                                    {$set:{refreshLoginToken: refreshLoginToken }, new: true})
        
        const tokenPayload = {
            refreshToken: refreshLoginToken,
            tokenId:storeRefreshToken._id
        }

        res.cookie("refreshLoginToken",tokenPayload,{
            httpOnly:true,
            secure:true,
            expires:thirtyDaysLater,
            samSite: 'strict'

        })

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
        const {refreshToken, tokenId} = req.cookie.refreshLoginToken
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);
        const refreshTokenDecoded = verifyRefreshToken(refreshToken)
        if ((!decoded && !authHeader && !(authHeader.startsWith('Bearer '))) && !refreshTokenDecoded) {
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
        const {userId} = req.body.userId
        const refreshLoginToken = generateRefreshToken(userId)
        if(!refreshToken){
            return res.status(500).json({
                status: "failed",
                message: "Server internal error"
            })
        }

        const storeRefreshToken = await RefreshToken.findByOneAndUpdate(
                                            userId,
                                            {$set:{refreshLoginToken:refreshToken},new:true})

        const tokenPayload = {
            refreshToken: refreshLoginToken,
            tokenId:storeRefreshToken._id
        }

        res.cookie("refreshLoginToken",tokenPayload,{
            httpOnly:true,
            secure:true,
            expires:thirtyDaysLater,
            samSite: 'strict'

        })

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
        const html = `
        <h1>Malawi Immigratiin</h1>
        <p>you requested to change the password here is the otp ${otp} </p>
        <p>Please do not share this code with anyone else</p>
        `
        const subject = "Immigration Request for Password Reset"
        
        await sendEmail(email,subject,html)
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
