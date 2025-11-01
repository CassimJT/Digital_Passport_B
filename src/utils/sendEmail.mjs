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
const sendEmail = async (to,subject,html) => {
   try{
     const mailOptions = {
        from: process.env.EMAIL_USER,
        to:to,
        subject:subject,
        html:html
    }
    
    const info = await transporter.sendMail(mailOptions)
        return {status:200, message:  "email sent succefully"}
   }
   catch(error){
        return {status:500, message: error}
   }
    
}

export default sendEmail