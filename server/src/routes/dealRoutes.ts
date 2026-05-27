import { Router } from 'express';
import { DealController } from '../controllers/dealController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/active', DealController.getActiveDeals);
router.post('/grab', authenticate, DealController.grabDeal);

export default router;
