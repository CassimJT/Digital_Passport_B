import NRB from "../models/Nrb.mjs"
import IdentityVerificationSession from "../models/IdentityVerificationSession.mjs"
import { maskEmail,maskPhone } from "../utils/helpers.mjs"

//verify
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
        message: "Invalid national Id",
      })
    }

    const session = await IdentityVerificationSession.create({
      citizenId: citizen._id,
      nationalId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    })

    return res.status(200).json({
      status: "success",
      referenceId: session._id,
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


