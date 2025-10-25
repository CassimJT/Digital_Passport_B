import mongoose from "mongoose";
import Nrb from "./Nrb.mjs";
const { Schema, model } = mongoose;

const otpSchema = new Schema({
  nationalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Nrb,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: { 
    type: String, 
    required: true 
  },
  otp: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "not verified",
    required: true,
    lowercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // OTP expires after 5 minutes (300 seconds)
  },
});

export default model("OTP", otpSchema);
