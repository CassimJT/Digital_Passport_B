//create passport application
import Application from "../models/Application.mjs"
export const createApplication = async (req, res, next) => {
  try {
    const applicationData = req.validatedData
    const newApplication = await Application.create(applicationData)
    return res.status(201).json({
      status: "success",
      data: newApplication,
    })
  } catch (error) {
    next(error)
  }
}
//update passport application
 export const updateApplication = async (req, res, next) => {
  try {
    const { id } =  req.validatedData
    const applicationData = req.body
    const updatedApplication = await Application.findByIdAndUpdate(id, applicationData, { new: true })
    if (!updatedApplication) {
      return res.status(404).json({
        status: "failed",
        message: "Application not found",
      })
    }
    return res.status(200).json({
      status: "success",
      data: updatedApplication,
    })
  } catch (error) {
    next(error)
  }
}
//fetch passport application
export const fetchApplication = async (req, res, next) => {
  try {
    const { id } = req.params
    const application = await Application.findById(id)
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

//submit passport application
export const submitApplication = async (req, res, next) => {
  try {
    const { id } = req.validatedData
    const application = await Application.findById(id)
    if (!application) {
      return res.status(404).json({
        status: "failed",
        message: "Application not found",
      })
    }
    application.status = "submitted"
    await application.save()
    return res.status(200).json({
      status: "success",
      data: application,
    })
  } catch (error) {
    next(error)
  }
}
