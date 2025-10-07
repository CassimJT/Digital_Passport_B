import User from "../models/User.mjs"
import Nrb from "../models/Nrb.mjs"
import {generateRandomCode, hashPassword} from "../utils/helpers.mjs"

// this is where the otp details wil be temporarily stored(use redis or mongodb in production)
const otpStore = new Map()

//logic to regester user
export const registerUser = async (req,res, next)=> {
    try {
        const {residentialAddress,createdAt,password} = req.validatedData
        const hashedPassword = hashPassword(password)
        const {nationalID} = req.validatedData
        nrbValidatedData =  await Nrb.findById(nationalID).select(`
            firstName 
            middleName 
            surName
            emailAddress 
            mobilePhone 
            colourOfEyes 
            maritalStatus  
            placeOfBirth 
            sex 
            dateOfBirth 
            secondNationality 
            nationality
        `)
        if(!nrbValidatedData){
            return res.status(404).json("NRB data for the user not availbale")
        }   

        // destructing the NRB object to get the required fields
        const {
            firstName ,
            middleName = '' ,
            surName,
            emailAddress, 
            mobilePhone, 
            colourOfEyes, 
            maritalStatus,  
            placeOfBirth,
            sex, 
            dateOfBirth,
            secondNationality, 
            nationality
        } = nrbValidatedData

        // checking uf the applicnt already has an account with immigration`s digital passport system

        const existingUser =  await User.findOne({nationalID})
        if (existingUser){
            return res.status(400).json({status: "applicant already has an account"})
        }

        const otp = generateRandomCode();
        otpStore.set(nationalID,{otp,data:{
            firstName ,
            middleName ,
            surName,
            hashedPassword,
            createdAt,
            emailAddress, 
            mobilePhone, 
            colourOfEyes, 
            maritalStatus,  
            placeOfBirth,
            residentialAddress,
            sex, 
            dateOfBirth,
            secondNationality, 
            nationality
        }})

        // creating name
        // const name = `${firstName} ${middleName} ${surName}`.trim();
        // const user = new User({
        //     name,
        //     emailAddress, 
        //     mobilePhone, 
        //     colourOfEyes, 
        //     maritalStatus,  
        //     placeOfBirth,
        //     sex, 
        //     dateOfBirth,
        //     secondNationality, 
        //     nationality
        // })

        // const applicantAccountCreation = await user.save()
         return res.status(200).json({status: "please verity the otp sent "})

    } catch (error) {
        next(error)
        
    }
}
// logic to logout user
export const loginUser = async (req,res)=> {

}
//logic to logout user
export const logoutUser = async (req,res)=> {

}
//logic to refresh token
export const refreshToken = async (req,res)=> {

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



  
 