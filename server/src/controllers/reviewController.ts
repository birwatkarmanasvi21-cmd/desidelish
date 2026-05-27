import { Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const reviewSchema = z.object({
  restaurantId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

export class ReviewController {
  static async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = reviewSchema.parse(req.body);
      const result = await ReviewService.createReview(userId, validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRestaurantReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = req.params;
      const result = await ReviewService.getRestaurantReviews(restaurantId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
