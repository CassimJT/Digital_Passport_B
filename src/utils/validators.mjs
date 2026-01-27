import Joi from 'joi';
import { upload } from './multerConfig.mjs';

// USER VALIDATION
export const registerUserSchema = Joi.object({
  password: Joi.string().required(),
  confirmPassword: Joi.string().required(),
  emailAddress: Joi.string().email().required(),
  createdAt:Joi.date()


});
//EMAIL VALIDATION
export const validateEmail = Joi.object({
  emailAddress: Joi.string().email()
    
})
//VALIDATE PASSWORD
export const validatePassword = Joi.object({
  password: Joi.string().required(),
  confirmPasword:Joi.string().required()


})
//VALIDATE CHANGE PASSWORD
export const validateChangePassword = Joi.object({
  userId: Joi.string(),
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmNewPassword: Joi.string().required()
 
})
//LOG IN VALIDATION
export const loginValidation = Joi.object({
  emailAddress: Joi.string().required(),
  password: Joi.string().required()
  
})

export const loginSchema = Joi.object({
  emailAddress: Joi.string().required(),
  password: Joi.string().required()
  
});


// PAYMENT VALIDATION
export const paymentSchema = Joi.object({
  payer: Joi.string().required(),
  amount: Joi.number().precision(2).required(),
  currency: Joi.string().valid('MWK').default('MWK').required(),
  paymentMethod: Joi.string().valid('bank card', 'mobile money', 'bank transfer'),
  transactionid: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().required(),
  timestamps: Joi.boolean().required()
  
});


// NOTIFICATION VALIDATION
export const notificationSchema = Joi.object({
  user: Joi.string().email().required(),
  type: Joi.string().valid("info", "error", "success"),
  title: Joi.string().required(),
  read: Joi.boolean(),
  link: Joi.string(),
  message: Joi.string().min(5).max(500).required(),
  createdAt: Joi.date().required()
  
});


//VALIDATE THE UPLOADS
export const uploadValidationSchema = Joi.object({
  type: Joi.string().valid('id_card', 'license', 'degree', 'certificate', 'other').required()
})

//VALIDATE FORM (this is the form that is saved to imigration)
export const validateForm = Joi.object({

})

//APPLICATION VALIDATION
export const applicationSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(), // User.mjs

  identitySessionId: Joi.string().hex().length(24).required(), // IdentityVerificationSession.mjs

  applicationType: Joi.string()
    .valid("PASSPORT", "VISA", "PERMIT", "CITIZENSHIP")
    .required(),

  status: Joi.string()
    .valid("DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED")
    .default("DRAFT"),

  paymentId: Joi.string().hex().length(24).optional(), // Payment.mjs

  supportingDocuments: Joi.array()
    .items(
      Joi.object({
        documentType: Joi.string().required(),
        fileId: Joi.string().required(),
      })
    )
    .default([]),

  metadata: Joi.object().unknown(true).default({}), 
})

// APPLICATION UPDATE VALIDATION
export const applicationUpdateSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),

  identitySessionId: Joi.string().hex().length(24).optional(),

  applicationType: Joi.string()
    .valid("PASSPORT", "VISA", "PERMIT", "CITIZENSHIP")
    .optional(),

  status: Joi.string()
    .valid("DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED")
    .optional(),

  paymentId: Joi.string().hex().length(24).optional(),

  supportingDocuments: Joi.array().items(
    Joi.object({
      documentType: Joi.string().required(),
      fileId: Joi.string().required(),
    })
  ).optional(),

  metadata: Joi.object().unknown(true).optional(),
})
.min(1)
