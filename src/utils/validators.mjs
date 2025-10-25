import Joi from 'joi';
import { upload } from './multerConfig.mjs';

// USER VALIDATION
export const registerUserSchema = Joi.object({
  residentialAddress:{
    district: Joi.string().required(),
    traditionalauthority: Joi.string().required(),
    village: Joi.string().required()
  },
  nationalId: Joi.string().required(),
  password: Joi.string().required(),
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

