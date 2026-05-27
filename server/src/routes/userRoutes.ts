import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // Protect all user routes

router.get('/profile', UserController.getProfile);
router.patch('/profile', UserController.updateProfile);
router.post('/addresses', UserController.addAddress);
router.get('/addresses', UserController.getAddresses);
router.delete('/addresses/:id', UserController.deleteAddress);

export default router;
