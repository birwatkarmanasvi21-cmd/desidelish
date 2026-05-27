import prisma from '../config/prisma';

export class DealService {
  static async getActiveDeals(filters: any) {
    const { restaurantId } = filters;
    const now = new Date();

    const where: any = {
      quantityAvailable: { gt: 0 }
    };

    if (restaurantId) where.restaurantId = restaurantId;

    return prisma.leftoverDeal.findMany({
      where,
      include: {
        menuItem: true,
        restaurant: { select: { name: true, logoUrl: true } }
      },
      orderBy: { endTime: 'asc' }
    });
  }

  static async grabDeal(userId: string, dealId: string, quantity: number) {
    return prisma.$transaction(async (tx) => {
      const deal = await tx.leftoverDeal.findUnique({
        where: { id: dealId },
        include: { menuItem: true }
      });

      if (!deal) throw new Error('Deal not found');
      
      const now = new Date();
      if (deal.endTime < now || deal.startTime > now) {
        throw new Error('Deal is not active');
      }

      if (deal.quantityAvailable < quantity) {
        throw new Error('Not enough quantity available');
      }

      // Update deal quantity
      await tx.leftoverDeal.update({
        where: { id: dealId },
        data: { quantityAvailable: { decrement: quantity } }
      });

      // In a real system, this would likely add to a cart or create a special order.
      // For this implementation, we'll return the deal confirmation.
      return {
        message: 'Deal grabbed successfully',
        deal: {
          itemName: deal.menuItem.name,
          discountedPrice: deal.discountedPrice,
          quantity
        }
      };
    });
  }
}
