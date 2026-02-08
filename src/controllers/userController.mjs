import User from "../models/User.mjs"
import mongoose from "mongoose"


//logic to get all users
export const getAllUsers = async (req,res,next)=> {
    try {
        const allUsers = await User.find()
        if(!allUsers){
            return res.status(404).json({
                status: "failed",
                message: "Not found ,failed to retrieve all users"})
        }
        return res.status(200).json({
            status: "success",
            message: allUsers
        })
    } catch (error) {
        next(error)
    }
   
}
//logic to get users by id
export const getUserById = async (req,res, next)=> {
    try {
        const id = new mongoose.Types.ObjectId(req.params.id)
        const oneUser = await User.findById(id)
        if(!oneUser){
            return res.status(404).json({
                status: "failed",
                message: "User not found"
            })
        }

        return res.status(200).json({
            status: "success",
            message: oneUser
        })
    } catch (error) {
        next(error)
        
    }
   
}
//logic to get profile
export const getMyProfile = async (req,res,next)=> {
    try {
        const id = req.user.userId
        const userProfile = await User.findById(id)

        if(!userProfile){
            return res.status(404).json({
                status: "failed", 
                message: "Not Found"
            })
        }

        return res.status(200).json({
            status: "success",
            message: userProfile
        })
    } catch (error) {
        next(error)
        
    }
    
}
//logic to update user profile
export const updateUserProfile = async (req,res, next)=> {
    try{

        const userId = new mongoose.Types.ObjectId(req.user.userId)
        const {emailAddress, residentialAddress} = req.body;
        const updates = {emailAddress,residentialAddress}
        // Define allowed fields for update
        const allowedUpdates =  ['emailAddress','residentialAddress'];
        const updateKeys = Object.keys(updates);
        const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));

        if (!isValidUpdate || updateKeys.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty update fields' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: {
                emailAddress: emailAddress,
                residentialAddress:residentialAddress} 
            },         // Use $set for partial updates
            { 
                new: true
            } // Return updated document
        );

        if (!user) {
            return res.status(404).json({
                status: "failed", 
                message: 'user not updated' 
                }
            )
        }

        return res.status(200).json({
        status: "success", 
        body: {
            message:"profile updated succesfully", 
            updatedProfile: user
        }
    });

  } catch (error) {
    next(error)
  }
   
}
//logic to update User
export const deleteUser = async (req,res)=> {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.id)
        const deletedUser = await User.findByIdAndDelete(userId)
        if(!deletedUser){
            return res.status(500).json({
                status: "failed", 
                message: "Internal server error occured deleting a user"
            })
        }

        return res.status(200).json({
            status:"success", 
            message: `user ${userId} got deleted successfully`
        })

    } catch (error) {
        
    }
   
}

//promote user
export const promoteUser = async (req, res, next) => {
  try {
    const userId = req.params.id
    const { role } = req.body

    const allowedRoles = ["admin", "office", "client"]

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid role",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      })
    }

    user.role = role
    await user.save()

    return res.status(200).json({
      status: "success",
      message: "User role updated successfully",
    })
  } catch (error) {
    next(error)
  }
}



  