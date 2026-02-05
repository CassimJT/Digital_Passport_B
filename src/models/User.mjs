import mongoose from "mongoose"
import { hashPassword } from "../utils/helpers.mjs"
import Nrb from "../models/Nrb.mjs"

const { Schema, model } = mongoose

const userSchema = new Schema({
  // Residential address
  residentialAddress: {
    district: { type: String, required: false, trim: true },
    traditionalauthority: { type: String, required: false, trim: true },
    village: { type: String, required: false, trim: true },
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
    minlength: [8, "Password must be at least 8 characters"],
  },

  // required when logging in
  emailAddress: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    lowercase: true,
  },

  role: {
    type: String,
    enum: ["superadmin", "admin", "officer", "client"],
    default: "client",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default model("User", userSchema)
