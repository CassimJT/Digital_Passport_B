import NRB from "../models/Nrb.mjs"
import IdentityVerificationSession from "../models/IdentityVerificationSession.mjs"
import { maskEmail,maskPhone } from "../utils/helpers.mjs"
import mongoose from "mongoose" 
//verify OTP
const REFRESH_TOKEN_TTL_MS =
  Number(process.env.JWT_REFRESH_EXPIRES_IN_MS) || 7 * 24 * 60 * 60 * 1000 // default 7 days

export const verifyNationalId = async (req, res, next) => {
  try {
    const { nationalId } = req.body

    if (!nationalId) {
      return res.status(400).json({
        status: "failed",
        message: "nationalId is required",
      })
    }

    const citizen = await NRB.findOne({ nationalId })
    if (!citizen) {
      return res.status(404).json({
        status: "failed",
        message: "Invalid National Id",
      })
    }

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)

    const session = await IdentityVerificationSession.create({
      citizenId: citizen._id,
      nationalId,
      status: "VERIFIED",
      expiresAt,
    })

    return res.status(200).json({
      status: "success",
      referenceId: session._id,
      expiresAt,
      profile: {
        firstName: citizen.firstName,
        surName: citizen.surName,
        emailMasked: maskEmail(citizen.emailAddress),
        mobileMasked: maskPhone(citizen.mobilePhone),
      },
    })
  } catch (error) {
    next(error)
  }
}
//get Identity Status
export const getIdentityStatus = async (req, res, next) => {
  try {
    const { referenceId } = req.params

    if (!mongoose.Types.ObjectId.isValid(referenceId)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid referenceId",
      })
    }

    const session = await IdentityVerificationSession.findById(referenceId)
      .populate("citizenId", "firstName surName nationalId")

    if (!session) {
      return res.status(404).json({
        status: "failed",
        message: "Verification session not found",
      })
    }

    if (session.expiresAt < new Date()) {
      session.status = "EXPIRED"
      await session.save()
    }

    return res.status(200).json({
      status: "success",
      referenceId: session._id,
      verificationStatus: session.status,
      citizen: session.citizenId,
      expiresAt: session.expiresAt,
    })
  } catch (error) {
    next(error)
  }
}


