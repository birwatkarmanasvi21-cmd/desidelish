import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/restaurant/:restaurantId', ReviewController.getRestaurantReviews);
router.post('/', authenticate, ReviewController.createReview);

export default router;
