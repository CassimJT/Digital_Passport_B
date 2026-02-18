// models/Immigration.mjs
import mongoose from "mongoose"

const { Schema } = mongoose

const immigrationSchema = new Schema({
  // Client reference
  client: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Passport details
  passportType: {
    type: String,
    enum: ["ordinary", "temporary", "service", "diplomatic"],
    required: true
  },
  serviceType: String,
  bookletType: String,
  
  // Personal details from NRB
  nationalId: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  middleName: String,
  surName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  sex: {
    type: String,
    enum: ["male", "female"],
    required: true
  },
  placeOfBirth: {
    district: String,
    traditionalauthority: String,
    village: String
  },
  
  // Passport specific fields
  height: String,
  mothersPlaceOfBirth: String,
  mothersMaidenName: String,
  fathersName: String,
  
  // Contact info
  mobilePhone: String,
  emailAddress: String,
  residentialAddress: {
    district: String,
    traditionalauthority: String,
    village: String
  },
  
  // References
  application: {
    type: Schema.Types.ObjectId,
    ref: "Application",
    required: true
  },
  payment: {
    type: Schema.Types.ObjectId,
    ref: "Payment"
  },
  
  // Status fields
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  status: {
    type: String,
    enum: ["active", "expired", "revoked"],
    default: "active"
  },
  
  // Passport validity
  passportNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  issuedAt: Date,
  expiryDate: Date
}, {
  timestamps: true
})

// Generate passport number before saving
immigrationSchema.pre('save', async function(next) {
  if (!this.passportNumber) {
    // Generate a unique passport number (you can customize this logic)
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    this.passportNumber = `P${year}${random}`
  }
  next()
})

export default mongoose.model("Immigration", immigrationSchema)