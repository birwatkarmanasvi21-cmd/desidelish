import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // All order routes require authentication

router.get('/cart', OrderController.getCart);
router.post('/cart', OrderController.addToCart);
router.post('/cart/sync', OrderController.syncCart);
router.post('/checkout', OrderController.placeOrder);
router.get('/history', OrderController.getOrderHistory);
router.get('/', OrderController.getOrderHistory); // GET /api/orders
router.put('/:id/status', OrderController.updateOrderStatus);

export default router;
