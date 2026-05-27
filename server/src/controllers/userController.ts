import { Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const addressSchema = z.object({
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  addressType: z.enum(['HOME', 'WORK', 'OTHER']).optional(),
  isDefault: z.boolean().optional()
});

export class UserController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await UserService.getProfile(userId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await UserService.updateProfile(userId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async addAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = addressSchema.parse(req.body);
      const result = await UserService.addAddress(userId, validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await UserService.getAddresses(userId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      await UserService.deleteAddress(userId, id);
      
      res.status(200).json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
