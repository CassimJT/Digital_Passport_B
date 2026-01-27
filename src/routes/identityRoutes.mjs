import express from 'express';
import { verifyNationalId,getIdentityStatus } from "../controllers/identityController.mjs";

const router = express.Router()
//verify
router.post('/verify-national-id',verifyNationalId);
router.get('/status/:referenceId',getIdentityStatus);
export default router