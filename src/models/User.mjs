import mongoose from 'mongoose';
import { hashPassword } from '../utils/helpers.mjs';
import Nrb from "../models/Nrb.mjs";
//import { errorMonitor } from 'nodemailer/lib/xoauth2';

  const { Schema, model } = mongoose;

  const userSchema = new Schema({
  

    //Residential address
    residentialAddress: {
      district: {type: String,required: true,trim: true,},
      traditionalauthority: {type: String,required: true,trim: true,},
      village: {type: String,required: true,trim: true,},
    },
    
    nationalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Nrb,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [8, "Password must be atleast 8 characters"],
    },

    //required when logging in
    emailAddress: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    
    createdAt: {
      type: Date,
      default: Date.now,
    }
});

/*userSchema.pre("save",async function(next) {
    if(!this.isModified("password")){
      return next();
    }else{
       this.password = await hashPassword(this.password);
    }
    next();
})*/

export default model('User', userSchema);
