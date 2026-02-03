import mongoose from "mongoose"

const { Schema, model, Types } = mongoose

const identityVerificationSessionSchema = new Schema(
  {
    citizenId: {
      type: Types.ObjectId,
      ref: "NRB",
      required: true,
      index: true,
    },
    nationalId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "EXPIRED"],
      default: "PENDING",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

// TTL — auto-delete exactly at expiresAt
identityVerificationSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)

export default model(
  "IdentityVerificationSession",
  identityVerificationSessionSchema
)
