import User from "../models/User.mjs"


//logic to get all users
export const getAllUsers = async (req,res,next)=> {
    try {
        const allUsers = await User.find()
        if(!allUsers){
            return res.status(404).json({status: "failed"})
        }
        return res.status(200).json(allUsers)
    } catch (error) {
        next(error)
    }
   
}
//logic to get users by id
export const getUserById = async (req,res, next)=> {
    try {
        const id = req.params.id
        const oneUser = await User.findOne(id)
        if(!oneUser){
            return res.status(404).json({status: "failed"})
        }
        return res.status(200).json(oneUser)
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
            return res.status(404).json({status: "Not Found"})
        }
        return res.status(200).json(userProfile)
    } catch (error) {
        next(error)
        
    }
    
}
//logic to update user profile
export const updateUserProfile = async (req,res, next)=> {
    try{
    const userId = req.user._id;
    const updates = req.body;

    // Define allowed fields for update
    const allowedUpdates = ['name', 'email', 'profile.bio', 'profile.avatar'];
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
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error)
  }
   
}
//logic to update User
export const deleteUser = async (req,res)=> {
    try {
        const userId = req.body.id
        const deletedUser = await User.findByIdAndUpdate(userId)
        if(!deletedUser){
            return res.status(404).json({status: "Not Found"})
        }

        return res.status(200).json({status: `user ${usrId} got deleted successfully`})

    } catch (error) {
        
    }
   
}



  