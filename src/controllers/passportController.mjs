import Application from "../models/Application.mjs"
import { canTransition } from "../utils/helpers.mjs"
import Imigration from "../models/Imigration.mjs"

// CREATE
export const createApplication = async (req, res, next) => {
  try {
    const { type, formData, identitySessionId } = req.validatedData
    const userId = req.user.id
    //const identitySessionId = req.user.identitySessionId

    if (!identitySessionId) {
      return res.status(400).json({
        status: "failed",
        message: "Missing identity verification session",
      })
    }

    const application = await Application.create({
      type,
      formData,
      applicant: userId,
      identitySession: identitySessionId,
      status: "DRAFT",
    })

    return res.status(201).json({
      status: "success",
      data: application,
    })
  } catch (error) {
    next(error)
  }
}


// UPDATE
export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params
    const update = req.validatedData

    const application = await Application.findOneAndUpdate(
      { _id: id, applicant: req.user.id, status: { $in: ["DRAFT", "IN_PROGRESS"] } },
      { ...update, status: "IN_PROGRESS" },
      { new: true }
    )

    if (!application) {
      return res.status(404).json({
        status: "failed",
        message: "Application not found or not editable",
      })
    }

    return res.status(200).json({
      status: "success",
      data: application,
    })
  } catch (error) {
    next(error)
  }
}

// FETCH
export const fetchApplication = async (req, res, next) => {
  try {
    const { id } = req.params

    const application = await Application.findOne({
      _id: id,
      applicant: req.user.id,
    })

    if (!application) {
      return res.status(404).json({
        status: "failed",
        message: "Application not found",
      })
    }

    return res.status(200).json({
      status: "success",
      data: application,
    })
  } catch (error) {
    next(error)
  }
}

// SUBMIT (Atomic & Idempotent)
export const submitApplication = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const application = await Application.findOneAndUpdate(
      {
        _id: id,
        applicant: userId,
        status: { $in: ["DRAFT", "IN_PROGRESS"] }, 
      },
      {
        $set: {
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      },
      { new: true }
    )

    if (!application) {
      return res.status(400).json({
        status: "failed",
        message: "Application already submitted or not editable",
      })
    }

    return res.status(200).json({
      status: "success",
      data: application,
    })
  } catch (error) {
    next(error)
  }
}


// Fetch applications for review
export const fetchApplicationsForReview = async (req, res, next) => {
  try {
    const applications = await Application.find({
      status: "SUBMITTED",
    }).populate("applicant")

    return res.json({ status: "success", data: applications })
  } catch (err) {
    next(err)
  }
}

export const fetchApplications = async (res, next) => {
  try {
        const allApplications = await Application.find()
          if(!allApplications){
            return res.status(404).json({
                  status: "failed",
                  message: "Not found ,failed to retrieve all applications"})
          }
          return res.status(200).json({
                status: "success",
                data: allApplications
            })
        } catch (error) {
            next(error)
        }
  }

// Start application review
export const startReview = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)

    if (!application || application.status !== "SUBMITTED") {
      return res.status(400).json({
        status: "failed",
        message: "Application not eligible for review",
      })
    }

    application.status = "UNDER_REVIEW"
    application.reviewer = req.user.id
    await application.save()

    return res.json({ status: "success", data: application })
  } catch (err) {
    next(err)
  }
}

// Approve application
export const approveApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)

    if (!application || application.status !== "UNDER_REVIEW") {
      return res.status(400).json({
        status: "failed",
        message: "Application not under review",
      })
    }

    // Create Immigration Record
    const immigrationRecord = await Immigration.create({
      client: application.applicant,
      passportType: application.type.toLowerCase(),
      serviceType: application.formData.serviceType,
      bookletType: application.formData.bookletType,
      nationalId: application.formData.nationalId,
      height: application.formData.height,
      placeOfBirth: application.formData.placeOfBirth,
      mothersPlaceOfBirth: application.formData.mothersPlaceOfBirth,
      paymentStatus: "completed",
    })

    application.status = "APPROVED"
    application.reviewedAt = new Date()
    application.immigrationRecord = immigrationRecord._id

    await application.save()

    return res.json({
      status: "success",
      data: application,
    })
  } catch (err) {
    next(err)
  }
}

// Reject application
export const rejectApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)

    if (!application || application.status !== "UNDER_REVIEW") {
      return res.status(400).json({
        status: "failed",
        message: "Application not under review",
      })
    }

    application.status = "REJECTED"
    application.reviewedAt = new Date()
    application.reviewer = req.user.id

    await application.save()

    return res.json({
      status: "success",
      data: application,
    })
  } catch (err) {
    next(err)
  }
}
