import Application from "../models/Application.mjs"
import { canTransition } from "../utils/helpers.mjs"
import Immigration from "../models/Immigration.mjs"
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
        $or: [
          {
            status: "SUBMITTED",
            $or: [
              { reviewer: null },
              { reviewer: { $exists: false } }
            ]
          },
          {
            status: "UNDER_REVIEW",
            reviewer: req.user.id
          }
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
    );

    if (!application) {
      return res.status(400).json({
        status: "failed",
        message:"Application not found, not available for review, " +
                "or already being reviewed by another officer",
      });
    }

    return res.json({
      status: "success",
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

// Approve application (with transaction support)
export const approveApplication = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    console.log('Starting approval for application:', req.params.id)
    
    // update the application status
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

    console.log('Application updated, now fetching with population')

    // Fetch the application with populated data separately
    const populatedApplication = await Application.findById(application._id)
      .populate({
        path: 'applicant',
        populate: {
          path: 'nationalId',
          model: 'NRB'
        }
      })
      .session(session)

    if (!populatedApplication.applicant) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        status: "failed",
        message: "Applicant not found"
      })
    }

    // Get NRB data from the populated applicant
    const nrbData = populatedApplication.applicant?.nationalId
    
    if (!nrbData) {
      console.log('Applicant data:', populatedApplication.applicant)
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        status: "failed",
        message: "Applicant NRB data not found. Please ensure the user has completed NRB verification.",
      })
    }

    console.log('NRB Data found:', {
      firstName: nrbData.firstName,
      surName: nrbData.surName,
      nationalId: nrbData.nationalId
    })

    // Validate required fields
    const requiredFormFields = ['serviceType', 'bookletType', 'height']
    const missingFormFields = requiredFormFields.filter(field => !populatedApplication.formData?.[field])
    
    if (!nrbData.nationalId || !nrbData.placeOfBirth || !nrbData.firstName || !nrbData.surName) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        status: "failed",
        message: "Missing required NRB data",
        details: {
          hasNationalId: !!nrbData.nationalId,
          hasPlaceOfBirth: !!nrbData.placeOfBirth,
          hasFirstName: !!nrbData.firstName,
          hasSurName: !!nrbData.surName
        }
      })
    }

    if (missingFormFields.length > 0) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        status: "failed",
        message: `Missing required fields: ${missingFormFields.join(', ')}`,
      })
    }

    // Create Immigration Record
    const immigrationData = {
      client: populatedApplication.applicant._id,
      passportType: populatedApplication.type.toLowerCase(),
      serviceType: populatedApplication.formData.serviceType,
      bookletType: populatedApplication.formData.bookletType,
      nationalId: nrbData.nationalId,
      firstName: nrbData.firstName,
      middleName: nrbData.middleName || "",
      surName: nrbData.surName,
      dateOfBirth: nrbData.dateOfBirth,
      sex: nrbData.sex,
      placeOfBirth: nrbData.placeOfBirth,
      height: populatedApplication.formData.height,
      mothersPlaceOfBirth: populatedApplication.formData.mothersPlaceOfBirth || nrbData.placeOfBirth?.district || "",
      mothersMaidenName: populatedApplication.formData.mothersMaidenName || "",
      fathersName: populatedApplication.formData.fathersName || "",
      mobilePhone: nrbData.mobilePhone,
      emailAddress: nrbData.emailAddress || populatedApplication.applicant.emailAddress,
      residentialAddress: nrbData.residentialAddress,
      application: populatedApplication._id,
      payment: populatedApplication.payment,
      paymentStatus: "completed",
      status: "active",
      issuedAt: new Date(),
      expiryDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)
    }

    console.log('Creating Immigration Record')

    const [immigrationRecord] = await Immigration.create([immigrationData], { session })

    // Update application with immigration record reference
    populatedApplication.immigrationRecord = immigrationRecord._id
    await populatedApplication.save({ session })

    await session.commitTransaction()
    session.endSession()

    console.log('Approval successful, immigration record created:', immigrationRecord._id)

    return res.json({
      status: "success",
      data: {
        application: {
          _id: populatedApplication._id,
          type: populatedApplication.type,
          status: populatedApplication.status,
          submittedAt: populatedApplication.submittedAt,
          reviewedAt: populatedApplication.reviewedAt
        },
        immigrationRecord
      },
    })
  } catch (err) {
    console.error('Approval error:', err)
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