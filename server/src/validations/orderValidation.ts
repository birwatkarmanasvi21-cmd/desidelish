import { z } from 'zod';

export const addToCartSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const placeOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(['CARD', 'UPI', 'COD']).optional(),
});
