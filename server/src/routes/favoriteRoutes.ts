import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protect all favorite routes
router.use(authenticate);

router.get('/', FavoriteController.getFavorites);
router.post('/', FavoriteController.addFavorite);
router.delete('/:id', FavoriteController.deleteFavorite);

export default router;
