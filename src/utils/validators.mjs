import Joi from 'joi';
import { upload } from './multerConfig.mjs';

// USER VALIDATION
export const registerUserSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  maidenName: Joi.string(),
  role: Joi.string().valid('client', 'admin','superadmin').required(),
  nationalID: Joi.string().required(),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z\d]){8,}$/).required(),
  confirmPassword: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z\d]){8,}$/).required(),


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
  phone: Joi.string().min(10).max(10),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z\d]){8,}$/).required()
  
})

export const loginSchema = Joi.object({
  nationalID: Joi.string().min(4).max(4).required(),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z\d]){8,}$/).required()
  
});


// PAYMENT VALIDATION
export const paymentSchema = Joi.object({
  amount: Joi.number().precision(2).required(),
  currency: Joi.string().valid('MWK').default('MWK').required(),
  method: Joi.string().valid('mpamba','airtemoney','fdh','nbm')
  
});


// NOTIFICATION VALIDATION
export const notificationSchema = Joi.object({
  recipient: Joi.string().email().required(),
  type: Joi.string().valid('payment','documentUpdate','alert'),
  message: Joi.string().min(5).max(500).required()
  
});


//VALIDATE THE UPLOADS
export const uploadValidationSchema = Joi.object({
  type: Joi.string().valid('id_card', 'license', 'degree', 'certificate', 'other').required()
})

