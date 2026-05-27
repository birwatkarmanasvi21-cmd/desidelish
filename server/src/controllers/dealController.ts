import { Request, Response, NextFunction } from 'express';
import { DealService } from '../services/dealService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const grabDealSchema = z.object({
  dealId: z.string().uuid(),
  quantity: z.number().int().positive()
});

export class DealController {
  static async getActiveDeals(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const result = await DealService.getActiveDeals(filters);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async grabDeal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { dealId, quantity } = grabDealSchema.parse(req.body);
      const result = await DealService.grabDeal(userId, dealId, quantity);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
