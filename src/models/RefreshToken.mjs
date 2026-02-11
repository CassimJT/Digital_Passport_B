import mongoose from "mongoose"

const { Schema, model, Types } = mongoose

const refreshTokenSchema = new Schema({
  user: { type: Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  replacedByToken: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export default model("RefreshToken", refreshTokenSchema)
