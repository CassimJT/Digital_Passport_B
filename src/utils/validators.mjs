import Joi from 'joi';
import { upload } from './multerConfig.mjs';

// USER VALIDATION
export const registerUserSchema = Joi.object({

});
//EMAIL VALIDATION
export const validateEmail = Joi.object({
    
})
//VALIDATE PASSWORD
export const validatePassword = Joi.object({


})
//VALIDATE CHANGE PASSWORD
export const validateChangePassword = Joi.object({
 
})
//LOG IN VALIDATION
export const loginValidation = Joi.object({
  
})

export const loginSchema = Joi.object({
  
});


// PAYMENT VALIDATION
export const paymentSchema = Joi.object({
  
});


// NOTIFICATION VALIDATION
export const notificationSchema = Joi.object({
  
});


//VALIDATE THE UPLOADS
export const uploadValidationSchema = Joi.object({
  type: Joi.string().valid('id_card', 'license', 'degree', 'certificate', 'other').required()
})

