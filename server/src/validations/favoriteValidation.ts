import { z } from 'zod';

export const createFavoriteSchema = z
  .object({
    restaurantId: z.string().uuid().nullable().optional(),
    menuItemId: z.string().uuid().nullable().optional(),
  })
  .refine((data) => data.restaurantId || data.menuItemId, {
    message: 'Either restaurantId or menuItemId must be provided',
  });
