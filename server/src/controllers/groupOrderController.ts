import { Response, NextFunction } from 'express';
import { GroupOrderService } from '../services/groupOrderService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const createGroupSchema = z.object({
  restaurantId: z.string().uuid()
});

const joinGroupSchema = z.object({
  code: z.string().min(6).max(6)
});

const addItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive()
});

export class GroupOrderController {
  static async createGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { restaurantId } = createGroupSchema.parse(req.body);
      const result = await GroupOrderService.createGroup(userId, restaurantId);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async joinGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { code } = joinGroupSchema.parse(req.body);
      const result = await GroupOrderService.joinGroup(userId, code);
      
      res.status(200).json({
        success: true,
        message: 'Joined group successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { groupId } = req.params;
      const { menuItemId, quantity } = addItemSchema.parse(req.body);
      const result = await GroupOrderService.addMemberItem(userId, groupId, menuItemId, quantity);
      
      res.status(201).json({
        success: true,
        message: 'Item added to group order',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getGroupDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await GroupOrderService.getGroupDetails(id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
