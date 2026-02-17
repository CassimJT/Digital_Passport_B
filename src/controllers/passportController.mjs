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
    }).populate("identitySession", "status verifiedAt",)

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
        .populate({
          path: 'applicant',
          populate: {
            path: 'nationalId',
            model: 'NRB' 
          }
        })
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

// Start application review
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
    // First update the application status
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
    ).populate({
      path: 'applicant',
      populate: {
        path: 'nationalId',
        model: 'NRB'
      }
    })

    if (!application) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        status: "failed",
        message: "Application not found, not under review, or you're not the reviewer",
      })
    }

    // Get NRB data from the populated applicant
    const nrbData = application.applicant?.nationalId
    
    if (!nrbData) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        status: "failed",
        message: "Applicant NRB data not found",
      })
    }

    // Validate required fields - combining formData and NRB requirements
    const requiredFormFields = ['serviceType', 'bookletType', 'height']
    const missingFormFields = requiredFormFields.filter(field => !application.formData[field])
    
    // Check if we have necessary NRB data
    if (!nrbData.nationalId || !nrbData.placeOfBirth || !nrbData.firstName || !nrbData.surName) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        status: "failed",
        message: "Missing required NRB data: nationalId, placeOfBirth, firstName, or surName",
      })
    }

    if (missingFormFields.length > 0) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        status: "failed",
        message: `Missing required fields for immigration record: ${missingFormFields.join(', ')}`,
      })
    }

    const [immigrationRecord] = await Immigration.create([{
      // Client reference
      client: application.applicant._id,
      // Passport details
      passportType: application.type.toLowerCase(),
      serviceType: application.formData.serviceType,
      bookletType: application.formData.bookletType,
      // Personal details from NRB
      nationalId: nrbData.nationalId,
      firstName: nrbData.firstName,
      middleName: nrbData.middleName || "",
      surName: nrbData.surName,
      dateOfBirth: nrbData.dateOfBirth,
      sex: nrbData.sex,
      placeOfBirth: nrbData.placeOfBirth,
      
      // Passport application specific fields
      height: application.formData.height,
      mothersPlaceOfBirth: application.formData.mothersPlaceOfBirth || nrbData.placeOfBirth?.district || "",
      mothersMaidenName: application.formData.mothersMaidenName || "",
      fathersName: application.formData.fathersName || "",
      mobilePhone: nrbData.mobilePhone,
      emailAddress: nrbData.emailAddress || application.applicant.emailAddress,
      residentialAddress: nrbData.residentialAddress,
      application: application._id,
      payment: application.payment,
      
      paymentStatus: "completed",
      status: "active",
      issuedAt: new Date(),
      expiryDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years from now
    }], { session })

    if (!application.immigrationRecord) {
      application.immigrationRecord = immigrationRecord._id
      await application.save({ session })
    }

    await session.commitTransaction()
    session.endSession()

    const populatedImmigrationRecord = await Immigration.findById(immigrationRecord._id)
      .populate('client', 'emailAddress residentialAddress')
      .populate('application')
      .populate('payment')

    return res.json({
      status: "success",
      data: {
        application: {
          _id: application._id,
          type: application.type,
          status: application.status,
          submittedAt: application.submittedAt,
          reviewedAt: application.reviewedAt
        },
        immigrationRecord: populatedImmigrationRecord,
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