import prisma from '../config/prisma';
import { calculateDistance } from '../utils/distance';

export class BudgetService {
  static async getCombinations(budget: number, location: { lat: number, lng: number }) {
    const restaurants = await prisma.restaurant.findMany({
      include: { menuItems: true }
    });

    const allItems = restaurants.flatMap(r => 
      r.menuItems.map(item => ({
        ...item,
        restaurantName: r.name,
        totalPrice: Number(item.price)
      }))
    );

    const combinations: any[] = [];
    
    // Single item combinations
    allItems.forEach(item => {
      if (item.totalPrice <= budget) {
        combinations.push({
          items: [item],
          totalPrice: item.totalPrice,
          count: 1
        });
      }
    });

    // Two item combinations 
    const maxItems = Math.min(allItems.length, 50); 
    for (let i = 0; i < maxItems; i++) {
      for (let j = i + 1; j < maxItems; j++) {
        const total = allItems[i].totalPrice + allItems[j].totalPrice;
        if (total <= budget) {
          combinations.push({
            items: [allItems[i], allItems[j]],
            totalPrice: total,
            count: 2
          });
        }
      }
    }

    return combinations
      .sort((a, b) => b.totalPrice - a.totalPrice)
      .slice(0, 10); 
  }
}
