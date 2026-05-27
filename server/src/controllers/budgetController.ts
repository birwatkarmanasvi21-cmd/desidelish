import { Request, Response, NextFunction } from 'express';
import { BudgetService } from '../services/budgetService';
import { z } from 'zod';

const budgetQuerySchema = z.object({
  budget: z.string().transform(val => parseFloat(val)),
  lat: z.string().transform(val => parseFloat(val)),
  lng: z.string().transform(val => parseFloat(val))
});

export class BudgetController {
  static async getCombinations(req: Request, res: Response, next: NextFunction) {
    try {
      const { budget, lat, lng } = budgetQuerySchema.parse(req.query);
      const result = await BudgetService.getCombinations(budget, { lat, lng });
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
