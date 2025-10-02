import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.mjs';
import { checkRole } from '../middleware/roleMiddleware.mjs';
import { 
  getAllUsers, 
  getUserById, 
  getMyProfile, 
  updateUserProfile, 
  deleteUser 
} from '../controllers/userController.mjs';


const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateJWT, checkRole(['admin']), getAllUsers);

// Get a specific user by ID (admin or provider)
router.get('/:id', authenticateJWT, checkRole(['admin']), getUserById);

// Get logged-in user's profile
router.get('/me/profile', authenticateJWT, getMyProfile);

// Update user profile (self)
router.patch('/me/profile', authenticateJWT, updateUserProfile);

// Delete a user (admin only)
router.delete('/:id', authenticateJWT, checkRole(['admin']), deleteUser);

export default router;
