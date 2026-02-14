import Application from "../models/Application.mjs"
import { canTransition } from "../utils/helpers.mjs"
import Immigration from "../models/Imigration.mjs"
import mongoose from "mongoose"

// CREATE
export const createApplication = async (req, res, next) => {
  try {
    const { type, formData, identitySessionId } = req.validatedData
    const userId = req.user.id

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
      { 
        _id: id, 
        applicant: req.user.id, 
        status: { $in: ["DRAFT", "IN_PROGRESS"] } 
      },
      { 
        $set: { 
          ...update, 
          status: "IN_PROGRESS",
          updatedAt: new Date() 
        } 
      },
      { new: true, runValidators: true }
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
    }).populate("identitySession", "status verifiedAt")

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
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
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

// Fetch applications for review (with pagination and filtering)
export const fetchApplicationsForReview = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const status = req.query.status || "SUBMITTED"

    const [applications, total] = await Promise.all([
      Application.find({ status })
        .populate("applicant", "name email")
        .sort({ submittedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments({ status })
    ])

    return res.json({
      status: "success",
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    next(err)
  }
}

// Start application review (Atomic version)
export const startReview = async (req, res, next) => {
  try {
    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "SUBMITTED",
        $or: [
          { reviewer: null },
          { reviewer: { $exists: false } }
        ]
      },
      {
        $set: {
          status: "UNDER_REVIEW",
          reviewer: req.user.id,
          reviewStartedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    )

    if (!application) {
      return res.status(400).json({
        status: "failed",
        message: "Application not found, already under review, or not in SUBMITTED status",
      })
    }

    return res.json({ 
      status: "success", 
      data: application 
    })
  } catch (err) {
    next(err)
  }
}

// Approve application (with transaction support)
export const approveApplication = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "UNDER_REVIEW",
        reviewer: req.user.id
      },
      {
        $set: {
          status: "APPROVED",
          reviewedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true, session }
    )

    if (!application) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        status: "failed",
        message: "Application not found, not under review, or you're not the reviewer",
      })
    }

    // Validate required fields for immigration record
    const requiredFields = ['serviceType', 'bookletType', 'nationalId', 'height', 'placeOfBirth', 'mothersPlaceOfBirth']
    const missingFields = requiredFields.filter(field => !application.formData[field])
    
    if (missingFields.length > 0) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        status: "failed",
        message: `Missing required fields for immigration record: ${missingFields.join(', ')}`,
      })
    }

    // Create Immigration Record
    const [immigrationRecord] = await Immigration.create([{
      client: application.applicant,
      passportType: application.type.toLowerCase(),
      serviceType: application.formData.serviceType,
      bookletType: application.formData.bookletType,
      nationalId: application.formData.nationalId,
      height: application.formData.height,
      placeOfBirth: application.formData.placeOfBirth,
      mothersPlaceOfBirth: application.formData.mothersPlaceOfBirth,
      mothersMaidenName: application.formData.mothersMaidenName || "",
      fathersName: application.formData.fathersName || "",
      application: application._id,
      paymentStatus: "completed",
      status: "active",
      issuedAt: new Date(),
      expiryDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years from now
    }], { session })

    // Update application with immigration record reference
    application.immigrationRecord = immigrationRecord._id
    await application.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.json({
      status: "success",
      data: {
        application,
        immigrationRecord
      },
    })
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    next(err)
  }
}

// Reject application (Atomic version)
export const rejectApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "UNDER_REVIEW",
        reviewer: req.user.id
      },
      {
        $set: {
          status: "REJECTED",
          reviewedAt: new Date(),
          rejectionReason: req.body.reason || "No reason provided",
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    )

    if (!application) {
      return res.status(400).json({
        status: "failed",
        message: "Application not found, not under review, or you're not the reviewer",
      })
    }

    return res.json({
      status: "success",
      data: application,
    })
  } catch (err) {
    next(err)
  }
}

// Get application statistics for admin dashboard
export const getApplicationStats = async (req, res, next) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          applications: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          count: 1,
          sampleApplications: { $slice: ["$applications", 5] }
        }
      }
    ])

    const total = await Application.countDocuments()

    return res.json({
      status: "success",
      data: {
        total,
        breakdown: stats
      }
    })
  } catch (err) {
    next(err)
  }
}

// Get user's applications
export const getUserApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [applications, total] = await Promise.all([
      Application.find({ applicant: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("immigrationRecord", "passportNumber issuedAt expiryDate status"),
      Application.countDocuments({ applicant: req.user.id })
    ])

    return res.json({
      status: "success",
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    next(err)
  }
}