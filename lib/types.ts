export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  category: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerImageUrl?: string;
  image: string;
  rating: number;
  reviewCount?: number;
  distance: number;
  deliveryTime: string;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  cuisine: string[];
  priceRange: number;
  isOpen: boolean;
  minOrder?: number;
  categories?: {
    id: string;
    name: string;
    menuItems: MenuItem[];
  }[];
}

export interface Deal {
  id: string;
  itemName: string;
  restaurant: string;
  restaurantId: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  image: string;
  timeLeft: string; // e.g., "2 hours"
  quantity: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image: string;
}

export interface GroupOrder {
  id: string;
  createdBy: string;
  inviteLink: string;
  members: string[];
  items: CartItem[];
  totalAmount: number;
}
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  avatarUrl?: string;
}

export interface Address {
  id: string;
  userId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  addressType?: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
  // Legacy support fallback
  address?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  restaurantId: string;
  restaurant: {
    name: string;
    logoUrl?: string;
  };
  deliveryAddressId: string;
  address: Address;
  status: 'PLACED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  restaurantId?: string;
  restaurant?: Restaurant;
  menuItemId?: string;
  menuItem?: MenuItem & { restaurant?: { name: string } };
  createdAt: string;
}

