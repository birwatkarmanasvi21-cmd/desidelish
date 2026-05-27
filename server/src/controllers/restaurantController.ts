import { Request, Response, NextFunction } from 'express';
import { RestaurantService } from '../services/restaurantService';
import { restaurantSchema, categorySchema, menuItemSchema } from '../validations/restaurantValidation';
import { AuthRequest } from '../middleware/auth';

export class RestaurantController {
  static async getAllRestaurants(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const result = await RestaurantService.getAllRestaurants(filters);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRestaurantById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await RestaurantService.getRestaurantById(id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async createRestaurant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = restaurantSchema.parse(req.body);
      const ownerId = req.user!.userId;
      const result = await RestaurantService.createRestaurant(validatedData, ownerId);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async addCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = req.params;
      const { name } = categorySchema.parse(req.body);
      const result = await RestaurantService.addMenuCategory(restaurantId, name);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId, categoryId } = req.params;
      const validatedData = menuItemSchema.parse(req.body);
      const result = await RestaurantService.addMenuItem(restaurantId, categoryId, validatedData);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
