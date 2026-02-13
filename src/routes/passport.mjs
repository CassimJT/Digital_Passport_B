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
    submitApplication,
    fetchApplicationsForReview,
    startReview,
    approveApplication,
    rejectApplication,
    fetchApplications
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

router.get(
  "/admin/applications",
  authenticateJWT,
  checkRole(["officer", "admin"]),
  fetchApplications
)

router.get(
  "/admin/applications?status=SUBMITTED",
  authenticateJWT,
  checkRole(["officer", "admin"]),
  fetchApplicationsForReview
)

router.post(
  "/admin/applications/:id/start-review",
  authenticateJWT,
  checkRole(["officer", "admin"]),
  startReview
)

router.post(
  "/admin/applications/:id/approve",
  authenticateJWT,
  checkRole(["officer", "admin"]),
  approveApplication
)

router.post(
  "/admin/applications/:id/reject",
  authenticateJWT,
  checkRole(["officer", "admin"]),
  rejectApplication
)


export default router;