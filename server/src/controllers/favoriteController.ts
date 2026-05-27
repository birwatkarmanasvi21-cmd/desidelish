import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { createFavoriteSchema } from '../validations/favoriteValidation';
import { AuthRequest } from '../middleware/auth';

export class FavoriteController {
  /**
   * GET /api/favorites
   * Fetch all favorites for the authenticated user
   */
  static async getFavorites(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
          restaurant: true,
          menuItem: {
            include: {
              restaurant: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: favorites,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/favorites
   * Save a restaurant or menu item as favorite
   */
  static async addFavorite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = createFavoriteSchema.parse(req.body);
      const { restaurantId, menuItemId } = validatedData;

      // Check if duplicate already exists
      const existing = await prisma.favorite.findFirst({
        where: {
          userId,
          restaurantId: restaurantId || null,
          menuItemId: menuItemId || null,
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'This item/restaurant is already in your favorites',
          data: existing,
        });
      }

      const favorite = await prisma.favorite.create({
        data: {
          userId,
          restaurantId: restaurantId || null,
          menuItemId: menuItemId || null,
        },
        include: {
          restaurant: true,
          menuItem: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Added to favorites successfully',
        data: favorite,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/favorites/:id
   * Delete a favorite by ID (checks ownership)
   */
  static async deleteFavorite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      // Find the favorite first to verify ownership
      const favorite = await prisma.favorite.findUnique({
        where: { id },
      });

      if (!favorite) {
        return res.status(404).json({
          success: false,
          message: 'Favorite record not found',
        });
      }

      if (favorite.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not own this favorite record',
        });
      }

      await prisma.favorite.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Removed from favorites successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
