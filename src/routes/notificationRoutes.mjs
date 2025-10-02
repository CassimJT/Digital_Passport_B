import express from 'express';
import {
  createNotification,
  markNotificationAsRead,
  deleteNotification
} from '../controllers/notificationController.mjs';

import { authenticateJWT } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Create a new notification (typically from system logic)
router.post('/', authenticateJWT, createNotification);

// Mark a notification as read
router.patch('/:id/read', authenticateJWT, markNotificationAsRead);

// Delete a notification
router.delete('/:id', authenticateJWT, deleteNotification);

export default router;