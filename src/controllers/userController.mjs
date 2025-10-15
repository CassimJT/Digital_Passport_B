import User from "../models/User.mjs"


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
        const id = req.body.id
        const oneUser = await User.findOne(id)
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
        const id = req.body.id
        const userProfile = await User.findOne(id)

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
    const {userId,name,email,profileBio,profileAvatar} = req.body;
    const updates = {name,email,profileBio,profileAvatar}

    // Define allowed fields for update
    const allowedUpdates = ['name', 'email', 'profileBio', 'profileAvatar'];
    const updateKeys = Object.keys(updates);
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));

    if (!isValidUpdate || updateKeys.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty update fields' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates }, // Use $set for partial updates
      { new: true} // Return updated document
    );

    if (!user) {
      return res.status(500).json({
        status: "failed", 
        message: 'Internal server error. user not updated' 
      });
    }

    return res.status(200).json({
        status: "success", 
        message: "profile updated succesfully" 
    });

  } catch (error) {
    next(error)
  }
   
}
//logic to update User
export const deleteUser = async (req,res)=> {
    try {
        const userId = req.body.id
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



  