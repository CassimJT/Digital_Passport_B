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
