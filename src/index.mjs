import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.mjs';  
import authRoutes from './routes/authRoutes.mjs';
import userRoutes from './routes/userRoutes.mjs';
import paymentRoutes from './routes/paymentRoutes.mjs';
import notificationRoutes from './routes/notificationRoutes.mjs';
import identityRoutes from './routes/identityRoutes.mjs';
import passport from './routes/passport.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupNotificationSocket } from './sockets/notificationSocket.mjs';
import { socketMiddleware } from './middleware/socketMiddleware.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// server for Socket.IO
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});


connectDB();

// ===== MIDDLEWARE IN CORRECT ORDER =====

// 1. General middleware 
app.use(express.json()); // JSON parsing for all routes
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// 2. Socket middleware
app.use(socketMiddleware(io));

// 3. Webhook route (needs raw body) for pay changu
app.use("/api/payments/webhook", express.raw({ type: "application/json" }), paymentRoutes);

// 4. Regular routes
app.use('/api/auth', authRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes); 
app.use('/api/notifications', notificationRoutes);
app.use('/api/passport', passport);

// 5. Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 6. Error handler 
app.use(errorHandler);

// Initialize sockets
setupNotificationSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});