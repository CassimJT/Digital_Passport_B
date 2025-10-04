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
   try{
     mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    }
    const info = await transporter.sendMail(mailOptions)
        return {status:200, message:  "email sent succefully"}
   }
   catch(error){
        return {status:500, message: "error sending email"}
   }
    
}