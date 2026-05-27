import { Router } from 'express';
import { GroupOrderController } from '../controllers/groupOrderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/create', GroupOrderController.createGroup);
router.post('/join', GroupOrderController.joinGroup);
router.post('/:groupId/items', GroupOrderController.addItem);
router.get('/:id', GroupOrderController.getGroupDetails);

export default router;
