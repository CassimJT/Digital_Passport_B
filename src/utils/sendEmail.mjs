import nodemailer from "nodemailer"

//transport
const transporter = nodemailer.createTransport({
   /* host: "smtp.gmail.com",
    port: 587,
    secure:false,*/
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS 
    }
})

//sending the email
export const sendEmail = async (to,subject,html) => {
    
}