import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../models/User.mjs"
import { hashPassword } from "../utils/helpers.mjs"
import Nrb from "../models/Nrb.mjs"

dotenv.config()

const MONGO_URL_CLASTER = process.env.MONGO_URL_CLASTER
const MONGO_URI_CAMPUSS = process.env.MONGO_URI_CAMPUSS

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URL_CLASTER || MONGO_URI_CAMPUSS)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    await createSuperUser()
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB

export const createSuperUser = async () => {
  const superAdminNationalId = process.env.SUPER_ADMIN_NATIONAL_ID
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD

  try {
    const existingSuperAdmin = await User.findOne({ role: "superadmin" })
    if (existingSuperAdmin) {
      console.log("Super admin already exists")
      return
    }

    const nrbCitizen = await Nrb.findOne({ nationalId: superAdminNationalId })
    if (!nrbCitizen) {
      throw new Error("Super admin citizen not found in NRB database")
    }

    const existingUser = await User.findOne({ nationalId: nrbCitizen._id })

    if (existingUser) {
      existingUser.role = "superadmin"
      await existingUser.save()
      console.log("Existing user promoted to superadmin")
      return
    }

    const hashedPassword = await hashPassword(superAdminPassword)

    const superAdmin = await User.create({
      nationalId: nrbCitizen._id,
      emailAddress: superAdminEmail,
      password: hashedPassword,
      role: "superadmin",
    })

    console.log("Super admin account created:", superAdmin.emailAddress)
  } catch (error) {
    console.error("Failed to create super admin:", error.message)
  }
}
