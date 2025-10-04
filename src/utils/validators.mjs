import Joi from 'joi';
import { upload } from './multerConfig.mjs';

// USER VALIDATION
export const registerUserSchema = Joi.object({
  nationalID: Joi.string().required(),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z\d]){8,}$/).required(),
  residentialAddress:{
    district: Joi.string().required(),
    traditionalAuthority: Joi.string().required(),
    village: Joi.string().required()
  },
  createdAt:Joi.date()


});
//EMAIL VALIDATION
export const validateEmail = Joi.object({
  email: Joi.string().email()
    
})
//VALIDATE PASSWORD
export const validatePassword = Joi.object({
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z\d]){8,}$/).required()


})
//VALIDATE CHANGE PASSWORD
export const validateChangePassword = Joi.object({
  changePassword: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z\d]){8,}$/).required()
 
})
//LOG IN VALIDATION
export const loginValidation = Joi.object({
  nationalID: Joi.string().min(4).max(4).required(),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z\d]){8,}$/).required()
  
})

export const loginSchema = Joi.object({
  nationalID: Joi.string().min(4).max(4).required(),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z\d]){8,}$/).required()
  
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

