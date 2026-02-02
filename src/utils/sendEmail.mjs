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

// Verify transporter
transporter.verify((error) => {
  if (error) {
    console.error("Email server error:", error);
  } else {
    console.log("Email server ready");
  }
});

//sending the email
const sendEmail = async (to,subject,html) => {
   try{
     const mailOptions = {
        from:`"My App" <${process.env.EMAIL_USER}>`,
        to:to,
        subject:subject,
        html:html
    }
    
    await transporter.sendMail(mailOptions)
        return {status:200, message:  "email sent succefully"}
   }
   catch(error){
        console.error("Send email error:", error);
        return { status: 500, message: "Failed to send email" };
   }
    
}

export default sendEmail