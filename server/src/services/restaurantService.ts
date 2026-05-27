import prisma from '../config/prisma';
import { calculateDistance } from '../utils/distance';

export class RestaurantService {
  static async getAllRestaurants(filters: any) {
    const { city, latitude, longitude, radius = 5, cuisine } = filters;
    
    const where: any = { isOpen: true };
    if (city) where.city = city;
    
    // In a real production setup with many restaurants, 
    // we would use PostGIS or a spatial index.
    // Here we fetch all (or filtered by city) and filter by distance.
    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        categories: {
          include: {
            menuItems: true
          }
        }
      }
    });

    if (latitude && longitude) {
      return restaurants
        .map(r => {
          const distance = calculateDistance(
            Number(latitude),
            Number(longitude),
            Number(r.latitude),
            Number(r.longitude)
          );
          return { ...r, distance };
        })
        .filter(r => r.distance <= Number(radius))
        .sort((a, b) => a.distance - b.distance);
    }

    return restaurants;
  }

  static async getRestaurantById(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            menuItems: true
          }
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { firstName: true, profilePictureUrl: true } } }
        }
      }
    });

    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant;
  }

  static async createRestaurant(data: any, ownerId: string) {
    return prisma.restaurant.create({
      data: {
        ...data,
        owners: {
          connect: { id: ownerId }
        }
      }
    });
  }

  static async addMenuCategory(restaurantId: string, name: string) {
    return prisma.menuCategory.create({
      data: {
        restaurantId,
        name
      }
    });
  }

  static async addMenuItem(restaurantId: string, categoryId: string, data: any) {
    return prisma.menuItem.create({
      data: {
        ...data,
        restaurantId,
        categoryId
      }
    });
  }
}
