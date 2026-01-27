import express from 'express';
import { verifyNationalId,getIdentityStatus } from "../controllers/identityController.mjs";

const router = express.Router()
//verify
router.post('/verfy-national-id',verifyNationalId);
router.get('/identity/status/:referenceId',getIdentityStatus);
export default router