import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.mjs';  
import authRoutes from './routes/authRoutes.mjs';
import userRoutes from './routes/userRoutes.mjs';
import paymentRoutes from './routes/paymentRoutes.mjs';
import notificationRoutes from './routes/notificationRoutes.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupNotificationSocket } from './sockets/notificationSocket.mjs';
import { socketMiddleware } from './middleware/socketMiddleware.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create server for Socket.IO
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Connect to MongoDB (UNCOMMENT THIS!)
connectDB();

// ===== MIDDLEWARE IN CORRECT ORDER =====

// 1. General middleware first
app.use(express.json()); // JSON parsing for all routes
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// 2. Socket middleware
app.use(socketMiddleware(io));

// 3. Webhook route (needs raw body)
app.use("/api/payments/webhook", express.raw({ type: "application/json" }), paymentRoutes);

// 4. Regular routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes); 
app.use('/api/notifications', notificationRoutes);

// 5. Health check
app.get('/', (req, res) => {
  res.send('Awakeya Backend API is running...');
});

// 6. Error handler (ALWAYS LAST)
app.use(errorHandler);

// Initialize sockets
setupNotificationSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});