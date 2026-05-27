// REST API Service Functions
// All endpoints match the Node.js + Express backend

import { apiCall, getAuthHeaders } from './api-client';
import type { Restaurant, MenuItem, Deal, Order, User } from './types';

// ============ AUTHENTICATION APIs ============

export const authService = {
  // POST /auth/signup
  signup: async (email: string, phone: string, password: string, firstName?: string, lastName?: string) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, phone, password, firstName, lastName }),
    });
  },

  // POST /auth/login
  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // POST /auth/logout
  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // GET /auth/profile
  getProfile: async () => {
    return apiCall('/auth/profile', {
      headers: getAuthHeaders(),
    });
  },

  // PUT /auth/profile
  updateProfile: async (data: Partial<User>) => {
    return apiCall('/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },
};

// ============ USER ADDRESS APIs ============

export const addressService = {
  // POST /users/addresses
  addAddress: async (address: any) => {
    return apiCall('/users/addresses', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(address),
    });
  },

  // GET /users/addresses
  getAddresses: async () => {
    return apiCall('/users/addresses', {
      headers: getAuthHeaders(),
    });
  },

  // PUT /users/addresses/:addressId
  updateAddress: async (addressId: string, address: any) => {
    return apiCall(`/users/addresses/${addressId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(address),
    });
  },

  // DELETE /users/addresses/:addressId
  deleteAddress: async (addressId: string) => {
    return apiCall(`/users/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // PUT /users/addresses/:addressId/default
  setDefaultAddress: async (addressId: string) => {
    return apiCall(`/users/addresses/${addressId}/default`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
  },
};

// ============ RESTAURANT APIs ============

export const restaurantService = {
  // GET /restaurants?city=&page=&limit=
  getRestaurants: async (filters?: {
    city?: string;
    cuisine?: string;
    minRating?: number;
    maxDeliveryFee?: number;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.cuisine) params.append('cuisine', filters.cuisine);
    if (filters?.minRating) params.append('minRating', String(filters.minRating));
    if (filters?.maxDeliveryFee) params.append('maxDeliveryFee', String(filters.maxDeliveryFee));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall<Restaurant[]>(`/restaurants${query}`);
  },

  // GET /restaurants/search?q=
  searchRestaurants: async (query: string) => {
    return apiCall<Restaurant[]>(`/restaurants/search?q=${encodeURIComponent(query)}`);
  },

  // GET /restaurants/:restaurantId
  getRestaurantById: async (restaurantId: string) => {
    return apiCall<Restaurant>(`/restaurants/${restaurantId}`);
  },

  // GET /restaurants/:restaurantId/nearby?latitude=&longitude=
  getNearbyRestaurants: async (latitude: number, longitude: number) => {
    return apiCall<Restaurant[]>(
      `/restaurants/nearby?latitude=${latitude}&longitude=${longitude}`
    );
  },
};

// ============ MENU & MENU ITEMS APIs ============

export const menuService = {
  // GET /restaurants/:restaurantId/menu
  getMenu: async (restaurantId: string) => {
    return apiCall(`/restaurants/${restaurantId}/menu`);
  },

  // GET /restaurants/:restaurantId/menu/:menuId/items
  getMenuItems: async (restaurantId: string, menuId: string) => {
    return apiCall<MenuItem[]>(
      `/restaurants/${restaurantId}/menu/${menuId}/items`
    );
  },

  // GET /menu-items/:itemId
  getMenuItem: async (itemId: string) => {
    return apiCall<MenuItem>(`/menu-items/${itemId}`);
  },

  // GET /menu-items/mood/:mood?restaurantId=
  getItemsByMood: async (mood: string, restaurantId?: string) => {
    const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return apiCall<MenuItem[]>(`/menu-items/mood/${mood}${query}`);
  },

  // GET /menu-items/search?q=
  searchMenuItems: async (query: string) => {
    return apiCall<MenuItem[]>(`/menu-items/search?q=${encodeURIComponent(query)}`);
  },
};

// ============ ORDER APIs ============

export const orderService = {
  // POST /orders/checkout
  createOrder: async (orderData: any) => {
    return apiCall('/orders/checkout', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
  },

  // GET /orders
  getUserOrders: async (filters?: { status?: string; limit?: number; page?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.page) params.append('page', String(filters.page));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/orders${query}`, {
      headers: getAuthHeaders(),
    });
  },

  // GET /orders/:orderId
  getOrder: async (orderId: string) => {
    return apiCall<Order>(`/orders/${orderId}`, {
      headers: getAuthHeaders(),
    });
  },

  // PUT /orders/:orderId/status (Transition status or cancel)
  updateOrderStatus: async (orderId: string, status: string) => {
    return apiCall(`/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
  },

  // POST /orders/cart/sync (Bulk sync cart items with backend DB)
  syncCart: async (items: { menuItemId: string; quantity: number }[]) => {
    return apiCall('/orders/cart/sync', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items }),
    });
  },
};

// ============ DEALS APIs ============

export const dealService = {
  // GET /deals?city=&page=&limit=
  getDeals: async (filters?: { city?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall<Deal[]>(`/deals${query}`);
  },

  // GET /deals/:dealId
  getDeal: async (dealId: string) => {
    return apiCall<Deal>(`/deals/${dealId}`);
  },

  // GET /deals/leftover/trending
  getTrendingLeftoverDeals: async () => {
    return apiCall<Deal[]>('/deals/leftover/trending');
  },

  // PUT /deals/:dealId/claim
  claimDeal: async (dealId: string, quantity: number) => {
    return apiCall(`/deals/${dealId}/claim`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
  },
};

// ============ BUDGET MODE APIs ============

export const budgetService = {
  // POST /budget/calculate (if needed, but using GET combinations for now)
  calculateMealCombinations: async (budget: number, preferences?: any) => {
    return apiCall('/budget/calculate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ budget, preferences }),
    });
  },

  // GET /budget/combinations?budget=&lat=&lng=
  getBudgetSuggestions: async (budget: number, lat: number = 12.9716, lng: number = 77.5946) => {
    const params = new URLSearchParams();
    params.append('budget', String(budget));
    params.append('lat', String(lat));
    params.append('lng', String(lng));

    return apiCall(`/budget/combinations?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
  },
};

// ============ GROUP ORDER APIs ============

export const groupOrderService = {
  // POST /group-orders
  createGroupOrder: async (groupOrderData: any) => {
    return apiCall('/group-orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupOrderData),
    });
  },

  // GET /group-orders/:groupOrderId
  getGroupOrder: async (groupOrderId: string) => {
    return apiCall(`/group-orders/${groupOrderId}`, {
      headers: getAuthHeaders(),
    });
  },

  // POST /group-orders/:groupOrderId/invite
  inviteMember: async (groupOrderId: string, email: string) => {
    return apiCall(`/group-orders/${groupOrderId}/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
  },

  // POST /group-orders/:groupOrderId/add-item
  addItemToGroupOrder: async (groupOrderId: string, itemData: any) => {
    return apiCall(`/group-orders/${groupOrderId}/add-item`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });
  },

  // GET /group-orders/:groupOrderId/split
  calculateSplit: async (groupOrderId: string, splitType?: 'equal' | 'itemwise') => {
    const params = splitType ? `?splitType=${splitType}` : '';
    return apiCall(`/group-orders/${groupOrderId}/split${params}`, {
      headers: getAuthHeaders(),
    });
  },

  // POST /group-orders/:groupOrderId/checkout
  checkoutGroupOrder: async (groupOrderId: string) => {
    return apiCall(`/group-orders/${groupOrderId}/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },
};

// ============ REVIEW & RATING APIs ============

export const reviewService = {
  // GET /reviews?restaurantId=&page=
  getReviews: async (restaurantId?: string, page?: number) => {
    const params = new URLSearchParams();
    if (restaurantId) params.append('restaurantId', restaurantId);
    if (page) params.append('page', String(page));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/reviews${query}`);
  },

  // POST /reviews
  submitReview: async (reviewData: any) => {
    return apiCall('/reviews', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
  },

  // PUT /reviews/:reviewId
  updateReview: async (reviewId: string, reviewData: any) => {
    return apiCall(`/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
  },
};

// ============ WISHLIST / FAVORITES APIs ============

export const wishlistService = {
  // GET /favorites
  getWishlist: async () => {
    return apiCall('/favorites', {
      headers: getAuthHeaders(),
    });
  },

  // POST /favorites
  addToWishlist: async (params: { restaurantId?: string; menuItemId?: string }) => {
    return apiCall('/favorites', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
  },

  // DELETE /favorites/:id
  removeFromWishlist: async (favoriteId: string) => {
    return apiCall(`/favorites/${favoriteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};

// ============ PROMOS & COUPONS APIs ============

export const promoService = {
  // POST /promos/validate
  validatePromo: async (code: string, orderValue: number) => {
    return apiCall('/promos/validate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, orderValue }),
    });
  },

  // GET /promos/available
  getAvailablePromos: async () => {
    return apiCall('/promos/available', {
      headers: getAuthHeaders(),
    });
  },
};
