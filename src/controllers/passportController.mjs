import Application from "../models/Application.mjs"

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

// SUBMIT
export const submitApplication = async (req, res, next) => {
  try {
    const { id } = req.params

    const application = await Application.findOne({
      _id: id,
      applicant: req.user.id,
      status: { $in: ["DRAFT", "IN_PROGRESS"] },
    })

    if (!application) {
      return res.status(404).json({
        status: "failed",
        message: "Application not found or already submitted",
      })
    }

    application.status = "SUBMITTED"
    application.submittedAt = new Date()
    await application.save()

    return res.status(200).json({
      status: "success",
      data: application,
    })
  } catch (error) {
    next(error)
  }
}
