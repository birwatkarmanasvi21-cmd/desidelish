import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurantController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', RestaurantController.getAllRestaurants);
router.get('/:id', RestaurantController.getRestaurantById);

// Protected routes (Owner/Admin)
router.post(
  '/', 
  // authenticate, 
  // authorize(['RESTAURANT_OWNER', 'ADMIN']), 
  RestaurantController.createRestaurant
);

router.post(
  '/:restaurantId/categories',
  // authenticate,
  // authorize(['RESTAURANT_OWNER', 'ADMIN']),
  RestaurantController.addCategory
);

router.post(
  '/:restaurantId/categories/:categoryId/items',
  // authenticate,
  // authorize(['RESTAURANT_OWNER', 'ADMIN']),
  RestaurantController.addItem
);

export default router;
