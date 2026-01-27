// models/Application.mjs
import mongoose from "mongoose"

const { Schema } = mongoose

const ApplicationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["PASSPORT", "VISA", "PERMIT", "CITIZENSHIP"],
      required: true,
      index: true,
    },

    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    identitySession: {
      type: Schema.Types.ObjectId,
      ref: "IdentityVerificationSession",
      required: true,
    },

    formData: {
      type: Schema.Types.Mixed, // dynamic per application type
      default: {},
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "IN_PROGRESS",
        "SUBMITTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "EXPIRED",
      ],
      default: "DRAFT",
      index: true,
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    immigrationRecord: {
      type: Schema.Types.ObjectId,
      ref: "Immigration",
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    metadata: {
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("Application", ApplicationSchema)
