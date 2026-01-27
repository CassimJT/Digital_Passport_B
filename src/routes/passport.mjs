import express from 'express';
const router = express.Router();
import { applicationSchema } from '../utils/validators.mjs';
import { validateRequest } from '../middleware/validateRequest.mjs';
import { applicationUpdateSchema } from '../utils/validators.mjs';
import { 
    createApplication,
    updateApplication,
    fetchApplication,
    submitApplication 
} from '../controllers/passportController.mjs';


router.post('/passport/applications', validateRequest(applicationSchema), createApplication)
router.put('/passport/applications/:id', validateRequest(applicationUpdateSchema), updateApplication)
router.get('/passport/applications/:id', fetchApplication)
router.post('/passport/applications', validateRequest(applicationSchema), submitApplication)
export default router;