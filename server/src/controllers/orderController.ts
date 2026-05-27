import { Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { addToCartSchema, placeOrderSchema } from '../validations/orderValidation';
import { AuthRequest } from '../middleware/auth';
import { EmailService } from '../services/emailService';
import prisma from '../config/prisma';

export class OrderController {
  static async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await OrderService.getCart(userId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async addToCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { menuItemId, quantity } = addToCartSchema.parse(req.body);
      const result = await OrderService.addToCart(userId, menuItemId, quantity);
      
      res.status(200).json({
        success: true,
        message: 'Item added to cart',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async syncCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { items } = req.body; // array of { menuItemId, quantity }
      const result = await OrderService.syncCart(userId, items);

      res.status(200).json({
        success: true,
        message: 'Cart synchronized successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async placeOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = placeOrderSchema.parse(req.body);
      const result = await OrderService.placeOrder(userId, validatedData);

      // In the background, fetch complete order and trigger invoice email & status simulation
      setTimeout(async () => {
        try {
          const completeOrder = await prisma.order.findUnique({
            where: { id: result.id },
            include: {
              items: { include: { menuItem: true } },
              user: true,
              address: true
            }
          });
          
          if (completeOrder) {
            // Send invoice email safely (non-blocking)
            await EmailService.sendInvoiceEmail(completeOrder, completeOrder.user.email);
            
            // Trigger automatic status simulation (non-blocking)
            OrderService.simulateOrderStatusUpdates(completeOrder.id);
          }
        } catch (bgError) {
          console.error('[Background Task Error] Failed in order post-processing:', bgError);
        }
      }, 0);
      
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await OrderService.getOrderHistory(userId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status: ${status}. Must be one of: PLACED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED`
        });
      }

      const result = await OrderService.updateOrderStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

