import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.mjs';
import { hashPassword } from '../utils/helpers.mjs';

dotenv.config();
const MONGO_URL_CLASTER  = process.env.MONGO_URL_CLASTER;
const MONGO_URI_CAMPUSS = process.env.MONGO_URI_CAMPUSS
const connectDB = async () => {
  try {
      const conn = await mongoose.connect(MONGO_URI_CAMPUSS);
    
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      //await createSuperUser();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit the app if DB fails
  }
};

export default connectDB;

export const createSuperUser = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "superadmin" });
    const hashedPassword = await hashPassword(process.env.SUPER_ADMIN_PASSWORD)
    if (existingAdmin) {
      console.log("Already have superadmin");
      return; 
    }

    const superAdmin = new User({
      firstname: "awakeyaAdmin",
      lastname: "awakeyaAdmin",
      username: "admin",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashPassword,
      role: process.env.SUPER_ADMIN_ROLE || "superadmin"
    });

    await superAdmin.save();
    console.log("Super admin created");
  } catch (error) {
    console.error(`Failed to add super user: ${error}`);
  }
};
