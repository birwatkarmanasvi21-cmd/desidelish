import prisma from '../config/prisma';

export class ReviewService {
  static async createReview(userId: string, data: any) {
    const { restaurantId, rating, comment } = data;

    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          restaurantId,
          rating,
          comment
        }
      });

      // Update restaurant's average rating
      const reviews = await tx.review.findMany({
        where: { restaurantId }
      });

      const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

      await tx.restaurant.update({
        where: { id: restaurantId },
        data: {
          rating: avgRating,
          reviewCount: reviews.length
        }
      });

      return review;
    });
  }

  static async getRestaurantReviews(restaurantId: string) {
    return prisma.review.findMany({
      where: { restaurantId },
      include: {
        user: { select: { firstName: true, profilePictureUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
