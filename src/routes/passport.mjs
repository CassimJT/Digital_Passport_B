import express from 'express';
const router = express.Router();
import { validateRequest } from '../middleware/validateRequest.mjs';
import { 
    createApplicationSchema,
    updateApplicationSchema 
} from '../utils/validators.mjs';
import { 
    createApplication,
    updateApplication,
    fetchApplication,
    submitApplication 
} from '../controllers/passportController.mjs';
import { authenticateJWT } from '../middleware/authMiddleware.mjs';
import { checkRole } from '../middleware/roleMiddleware.mjs';

router.post(
  "/applications",
  authenticateJWT,
  checkRole(["client"]),
  validateRequest(createApplicationSchema),
  createApplication
)

router.put(
  "/applications/:id",
  authenticateJWT,
  checkRole(["client"]),
  validateRequest(updateApplicationSchema),
  updateApplication
)

router.get(
  "/applications/:id",
  authenticateJWT,
  checkRole(["client"]),
  fetchApplication
)

router.post(
  "/applications/:id/submit",
  authenticateJWT,
  checkRole(["client"]),
  submitApplication
)

export default router;