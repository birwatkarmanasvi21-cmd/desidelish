/**
 * API Utility for connecting to the Node.js + Express backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Generic fetch wrapper for API calls
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error: ${response.status}`);
  }

  const result = await response.json();
  // Most of our backend responses wrap data in a { success: true, data: ... } object
  return result.data !== undefined ? result.data : result;
}

/**
 * Restaurant APIs
 */
export const getRestaurants = async () => {
  const restaurants = await apiFetch<any[]>('/restaurants');
  return restaurants.map(mapRestaurant);
};

export const getRestaurantById = async (id: string) => {
  const restaurant = await apiFetch<any>(`/restaurants/${id}`);
  return mapRestaurant(restaurant);
};

/**
 * Mapping helper for Restaurant
 */
function mapRestaurant(r: any) {
  return {
    ...r,
    image: r.bannerImageUrl || r.logoUrl || '/placeholder-restaurant.jpg',
    cuisine: typeof r.cuisine === 'string' 
      ? r.cuisine.split(',').map((c: string) => c.trim()).filter(Boolean) 
      : (Array.isArray(r.cuisine) ? r.cuisine : ['International']), 
    distance: r.distance || 0.5,
    deliveryTime: `${r.deliveryTimeMin}-${r.deliveryTimeMax} mins`,
    priceRange: r.priceRange || 2,
    rating: parseFloat(r.rating) || 0,
    categories: r.categories?.map((cat: any) => ({
      ...cat,
      menuItems: cat.menuItems?.map((item: any) => ({
        ...item,
        image: item.imageUrl || '/placeholder-food.jpg',
        price: parseFloat(item.price) || 0,
        rating: 4.5, // Default rating for items if not in DB
      }))
    }))
  };
}

/**
 * Deals APIs
 */
export const getDeals = async () => {
  const deals = await apiFetch<any[]>('/deals/active');
  
  // Map leftover deals to the frontend expected format
  return deals.map((deal: any) => ({
    id: deal.id,
    itemName: deal.menuItem?.name || 'Unknown Item',
    restaurant: deal.restaurant?.name || 'Unknown Restaurant',
    restaurantId: deal.restaurantId || deal.restaurant?.id || '',
    originalPrice: parseFloat(deal.originalPrice),
    discountedPrice: parseFloat(deal.discountedPrice),
    discount: deal.discountPercentage,
    image: deal.menuItem?.imageUrl || '/placeholder-food.jpg',
    timeLeft: calculateTimeLeft(deal.endTime),
    quantity: deal.quantityAvailable,
  }));
};

/**
 * Helper to calculate time left for deals
 */
function calculateTimeLeft(endTime: string): string {
  const end = new Date(endTime);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Expired';
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) return `${diffHours}h ${diffMins}m`;
  return `${diffMins}m`;
}
