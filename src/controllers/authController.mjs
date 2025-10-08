import User from "../models/User.mjs"
import Nrb from "../models/Nrb.mjs"
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.mjs"
import {generateRandomCode, 
        hashPassword,
        comparePassword 
    } from "../utils/helpers.mjs"

// this is where the otp details wil be temporarily stored(use redis or mongodb in production)
const otpStore = new Map()

//logic to regester user
export const registerUser = async (req,res, next)=> {
    try {
        const data = req.validatedData
        const hashedPassword = hashPassword(data.password)
        nrbValidatedData =  await Nrb.findById(data.nationalID)
        if(!nrbValidatedData){
            return res.status(404).json("NRB data for the user not availbale")
        }   

        const user = new User({
            residentialaddress: data.residentialAddress,
            nationalId: data.nationalID,
            password: hashedPassword
        })

        const saveApplicant = await user.save()
        if (!saveApplicant){
                

        }
            

    } catch (error) {
        next(error)
        
    }
}
// logic to logout user
export const loginUser = async (req,res, next)=> {

    try {
        const loginCredentials = req.validatedData
        if (!loginCredentials || !loginCredentials.password || !loginCredentials.nationalID){
            return res.status(400).json({status: "Bad request"})
        }
        const verifyLoginCredentials = await User.findOne({nationalid: loginCredentials.nationalID})
        if(!verifyLoginCredentials || !(comparePassword(loginCredentials.password, verifyLoginCredentials.password))){
            return res.status(400).json({status: "incorrect username/password"})
        }

        // user assigned a jwt session token
        const loginSessionToken = generateAccessToken(verifyLoginCredentials)

        return res.status(200).json({
            status: "success",
            data: {
                token: loginSessionToken,
                userID: user._id,
                redirectURL: "/dashboard" // to be replace by a real url
            }
        })
    } catch (error) {
        next(error)
    }

}
//logic to logout user
export const logoutUser = async (req,res)=> {
    try {
        console.log(`User ${req.user._id} logged out successfully`);

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
export const refreshToken = async (req,res)=> {
    try {
        const userId = req.params.id
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
        
    }

}
//logic to reguest reset passwprd
export const requestPasswordReset = async (req,res)=> {

}
//logic to reset password
export const resetPassword = async (req,res)=> {

}
//logic to change passwod
export const changePassword = async (req,res)=> {

}



  
 