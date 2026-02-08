import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.mjs';
import { checkRole } from '../middleware/roleMiddleware.mjs';
import { 
  getAllUsers, 
  getUserById, 
  getMyProfile, 
  updateUserProfile, 
  deleteUser,
  promoteUser,
} from '../controllers/userController.mjs';


const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateJWT, checkRole(['admin','superadmin','officer']), getAllUsers);

// Get a specific user by ID (admin or provider)
router.get('/:id', authenticateJWT, checkRole(['admin','superadmin','officer']), getUserById);

// Get logged-in user's profile
router.get('/me/profile', authenticateJWT, getMyProfile);

// Update user profile (self)
router.patch('/me/profile', authenticateJWT, updateUserProfile);

// Delete a user (admin only)
router.delete('/:id', authenticateJWT, checkRole(['admin','superadmin','officer']), deleteUser);

// Promote a user (admin only)
router.patch('/:id/promote', authenticateJWT, checkRole(['admin','superadmin']), promoteUser);

export default router;
