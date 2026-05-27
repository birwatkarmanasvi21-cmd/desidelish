import { z } from 'zod';

export const restaurantSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  deliveryTimeMin: z.number().optional(),
  deliveryTimeMax: z.number().optional(),
  logoUrl: z.string().url().optional(),
  bannerImageUrl: z.string().url().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1),
});

export const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
});
