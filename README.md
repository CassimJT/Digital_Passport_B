# Digital_Passport_B
This is a backend project for Immigration tellered to digitise Passport making process.

Digital_Passport_Backend/src/

    │
    ├── config/
    │   ├── db.mjs                # Handles MongoDB connection using Mongoose
    │   ├── passport.mjs          # Passport.js strategies (Local & JWT)
    │   └── session.mjs           # Session store configuration (MongoDB-backed)
    │
    ├── controllers/             # Logic for handling requests and responses
    │   ├── authController.mjs           # Login, register, and auth logic
    │   ├── userController.mjs           # CRUD operations for users
    │   ├── paymentController.mjs        # Payment processing & records
    │   └── notificationController.mjs   # Sending and retrieving notifications
    │
    ├── middleware/              # Functions that run before route handlers
    │   ├── authMiddleware.mjs   # Verifies JWT tokens
    │   ├── roleMiddleware.mjs   # Ensures only certain roles can access routes
    │   ├── errorHandler.mjs     # Centralized error handling
    │   └── passportAuth.mjs     # Wrappers for Passport authentication
    │
    ├── models/                  # Mongoose schemas for MongoDB
    │   ├── User.mjs             # User schema & model
    │   ├── Nrb.mjs              # Service schema
    │   ├── Payment.mjs          # Payment schema
    │   └── Notification.mjs     # Notification schema
    │
    ├── routes/                  # API endpoints
    │   ├── authRoutes.mjs
    │   ├── userRoutes.mjs
    │   ├── paymentRoutes.mjs
    │   └── notificationRoutes.mjs
    │
    ├── utils/                   # Helper functions
    │   ├── jwt.mjs              # JWT token generation & verification
    │   ├── validators.mjs       # Joi schema validations
    │   └── helpers.mjs          # General utility functions
    │
    ├── .env                     # Environment variables (not committed)
    ├── .gitignore               # Ignored files/folders (e.g., node_modules, .env)
    ├── package.json             # Project dependencies & scripts
    ├── index.mjs / server.js    # Main entry point for the server
    └── README.md                # Documentation for the project

Environmental variables

    PORT=5000
    MONGO_URI=mongodb://localhost:27017/
    MONGO_URI_CAMPUSS=mongodb://localhost:27017/imigration
    MONGO_URL_CLASTER=""
    SUPER_ADMIN_EMAIL=awakeya@gmail.com
    SUPER_ADMIN_PASSWORD=12345678
    SUPER_ADMIN_ROLE=superadmin

Not: 
    Hey team!  Just a quick update on our workflow: Before starting any new task, please make sure you have MongoDB Compass installed for local testing. When you begin work, always create a new branch from the dev branch with a clear name like "feature/login-page" or "fix/payment-bug". Once you finish and your PR gets approved, I'll handle merging it into dev and then to main - you can just delete your feature branch afterwards. This keeps everything organized and makes sure we're all working smoothly together! Thanks everyone! 
    
    Branch structure
    main (protected) ← Only I merge here
    └── dev (protected) ← Your PR destination
    └── feature/your-clear-task-name ← Your temporary branch

Coding style
    variables:  camel case
    all variables must be at the top of ever controller inside try catch bloc
    following top dow approach
    eng. 
    try{
        //all variables here

    }catch {
        console.error("Error creating provider profile:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
`
    }

    when success return the block as follow 
    {
        satus: "success",
        message "message body"
    }

    follow this example:
    //logic to change the password
export const changePassword = async (req, res) => {
     try {
            const {currentPassword,newPassword} = req.validatedData;
            const userId = req.user._id;

            const findUser = await User.findById(userId);
            if(!findUser) {
                  return res.status(404).json({
                        message: "No user found"
                  });
            }

            const isMash = comparePassword(currentPassword, findUser.password);
            if(!isMash){
                  return res.status(400).json({
                        message: "Currrent password in incorrect"
                  })
            }

            const hashedPassword = hashPassword(newPassword);
            findUser.password = hashedPassword;
            await findUser.save();

            return res.status(200).json({
                  message: "Password changed successfully"
            });
      
     } catch (error) {
            console.log(`Fiald to change the password: ${error}`);
            return res.status(500).json({
                  message: "Ineternal server error"
            });
     }
};

