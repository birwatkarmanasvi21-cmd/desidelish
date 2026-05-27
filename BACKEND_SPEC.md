# FoodHub Backend Specification

## Database Schema & Architecture

### 1. USERS TABLE
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_picture_url VARCHAR(500),
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP
);
```

**Fields:**
- `id`: Unique user identifier
- `email`: User's Gmail/email (must be unique)
- `phone`: 10-digit phone number (unique)
- `password_hash`: bcrypt hashed password
- `profile_picture_url`: User avatar/profile image
- `total_orders`: Count of completed orders
- `total_spent`: Total amount spent across all orders
- `rating`: Average rating given by other users (1-5)
- `created_at`, `updated_at`: Timestamps for audit trail
- `deleted_at`: For soft deletes
- `is_active`: Account status

---

### 2. USER_ADDRESSES TABLE
```sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(10),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address_type ENUM('home', 'work', 'other') DEFAULT 'home',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_coordinates ON user_addresses(latitude, longitude);
```

**Fields:**
- `user_id`: Foreign key to users table
- `address_line1`, `address_line2`: Delivery address
- `city`, `state`, `postal_code`: Location breakdown
- `latitude`, `longitude`: Geolocation coordinates (for distance-based sorting)
- `address_type`: Home, Work, or Other
- `is_default`: Primary delivery address for user

---

### 3. RESTAURANTS TABLE
```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  banner_image_url VARCHAR(500),
  cuisines VARCHAR(500), -- JSON array: ["Italian", "Pizza", "Pasta"]
  rating DECIMAL(3,2),
  review_count INT DEFAULT 0,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  min_order DECIMAL(8,2),
  delivery_fee DECIMAL(8,2),
  delivery_time_min INT, -- in minutes
  delivery_time_max INT, -- in minutes
  is_open BOOLEAN DEFAULT true,
  opens_at TIME,
  closes_at TIME,
  operational_days VARCHAR(50), -- "Mon-Sun" or custom
  preparation_time INT DEFAULT 30, -- in minutes
  avg_rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_coordinates ON restaurants(latitude, longitude);
CREATE INDEX idx_restaurants_rating ON restaurants(avg_rating DESC);
CREATE INDEX idx_restaurants_is_open ON restaurants(is_open);
```

**Fields:**
- `cuisines`: Array of cuisine types (stored as JSON)
- `rating`, `review_count`: Aggregate ratings
- `latitude`, `longitude`: Restaurant location
- `min_order`: Minimum order value required
- `delivery_fee`: Cost of delivery from this restaurant
- `delivery_time_min/max`: Estimated delivery window
- `operational_days`: Days and hours of operation

---

### 4. RESTAURANT_MENUS TABLE
```sql
CREATE TABLE restaurant_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "Breakfast", "Lunch", "Dinner"
  description TEXT,
  display_order INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menus_restaurant_id ON restaurant_menus(restaurant_id);
```

**Fields:**
- `restaurant_id`: Which restaurant this menu belongs to
- `name`: Menu category (Breakfast, Lunch, Dinner, etc.)
- `display_order`: Order to show menus on frontend

---

### 5. MENU_ITEMS TABLE
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES restaurant_menus(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  price DECIMAL(8,2) NOT NULL,
  discounted_price DECIMAL(8,2),
  discount_percentage INT, -- 0-100
  calories INT,
  preparation_time INT, -- in minutes
  spice_level INT, -- 0-5
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  allergens VARCHAR(500), -- JSON array
  rating DECIMAL(3,2),
  review_count INT DEFAULT 0,
  stock INT, -- quantity available (-1 for unlimited)
  available_from TIME,
  available_until TIME,
  is_active BOOLEAN DEFAULT true,
  tags VARCHAR(500), -- JSON: ["bestseller", "new", "spicy", "healthy"]
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_items_menu_id ON menu_items(menu_id);
CREATE INDEX idx_items_is_vegetarian ON menu_items(is_vegetarian);
CREATE INDEX idx_items_is_active ON menu_items(is_active);
CREATE INDEX idx_items_rating ON menu_items(rating DESC);
```

**Fields:**
- `spice_level`: 0-5 rating for spice intensity (for mood-based filtering)
- `allergens`: Array of allergen information
- `tags`: Array including "bestseller", "new", "spicy", "healthy", etc.
- `available_from`, `available_until`: Time-based availability
- `stock`: Track availability in real-time

---

### 6. MENU_ITEM_MODIFIERS TABLE
```sql
CREATE TABLE menu_item_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "Size", "Add-ons", "Sauces"
  is_required BOOLEAN DEFAULT false,
  allow_multiple BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modifiers_item_id ON menu_item_modifiers(menu_item_id);
```

**Fields:**
- `name`: Modifier group name (Size, Toppings, etc.)
- `is_required`: Whether user must select this modifier
- `allow_multiple`: Can user select multiple options

---

### 7. MODIFIER_OPTIONS TABLE
```sql
CREATE TABLE modifier_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modifier_id UUID NOT NULL REFERENCES menu_item_modifiers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "Small", "Medium", "Large"
  price_adjustment DECIMAL(8,2) DEFAULT 0,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_options_modifier_id ON modifier_options(modifier_id);
```

---

### 8. ORDERS TABLE
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "FH-20240310-001"
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  delivery_address_id UUID REFERENCES user_addresses(id),
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'failed') DEFAULT 'pending',
  order_type ENUM('delivery', 'pickup') DEFAULT 'delivery',
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_code VARCHAR(50),
  delivery_fee DECIMAL(8,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('card', 'upi', 'wallet', 'cash_on_delivery') DEFAULT 'card',
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  rating INT, -- 1-5 stars
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason VARCHAR(500)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

**Fields:**
- `order_number`: Human-readable order ID
- `status`: Track order progress through fulfillment
- `order_type`: Delivery or pickup
- `discount_code`: Coupon/promo code used
- `payment_status`: Separate from order status
- `special_instructions`: Special requests, allergies, etc.
- `rating`, `review`: Post-delivery feedback

---

### 9. ORDER_ITEMS TABLE
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  modifiers JSON, -- Array of selected modifiers
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

**Fields:**
- `modifiers`: JSON array storing selected modifier options and their prices

---

### 10. DEALS TABLE
```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed_amount', 'bogo') DEFAULT 'percentage',
  discount_value DECIMAL(8,2) NOT NULL, -- percentage (0-100) or fixed amount
  deal_type ENUM('flash', 'leftover', 'seasonal', 'combo') DEFAULT 'leftover',
  min_order DECIMAL(8,2),
  max_uses INT, -- total times deal can be used (-1 for unlimited)
  uses_remaining INT,
  starts_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deals_restaurant_id ON deals(restaurant_id);
CREATE INDEX idx_deals_menu_item_id ON deals(menu_item_id);
CREATE INDEX idx_deals_expires_at ON deals(expires_at);
CREATE INDEX idx_deals_is_active ON deals(is_active);
```

**Fields:**
- `deal_type`: Leftover deals expire quickly, flash deals are limited time
- `discount_type`: Percentage discount, fixed amount, or BOGO
- `uses_remaining`: Track inventory of deals (important for leftovers)
- `expires_at`: When deal automatically becomes inactive

---

### 11. GROUP_ORDERS TABLE
```sql
CREATE TABLE group_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_order_code VARCHAR(50) UNIQUE NOT NULL, -- Shareable code
  creator_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  status ENUM('open', 'closed', 'submitted', 'cancelled') DEFAULT 'open',
  deadline TIMESTAMP NOT NULL,
  delivery_address_id UUID REFERENCES user_addresses(id),
  subtotal DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(8,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  split_type ENUM('equal', 'itemwise') DEFAULT 'equal',
  submitted_order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_group_orders_creator_id ON group_orders(creator_id);
CREATE INDEX idx_group_orders_restaurant_id ON group_orders(restaurant_id);
CREATE INDEX idx_group_orders_code ON group_orders(group_order_code);
```

**Fields:**
- `group_order_code`: Shareable link/code for group members
- `deadline`: When group ordering closes
- `split_type`: How to split bill (equal or per-item)
- `submitted_order_id`: Link to main order created from group

---

### 12. GROUP_ORDER_MEMBERS TABLE
```sql
CREATE TABLE group_order_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_order_id UUID NOT NULL REFERENCES group_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  contribution DECIMAL(10,2) DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_members_group_order_id ON group_order_members(group_order_id);
CREATE INDEX idx_members_user_id ON group_order_members(user_id);
```

---

### 13. GROUP_ORDER_ITEMS TABLE
```sql
CREATE TABLE group_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_order_id UUID NOT NULL REFERENCES group_orders(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES group_order_members(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  modifiers JSON,
  special_instructions TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_group_items_group_order_id ON group_order_items(group_order_id);
CREATE INDEX idx_group_items_member_id ON group_order_items(member_id);
```

---

### 14. REVIEWS TABLE
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  menu_item_id UUID REFERENCES menu_items(id),
  order_id UUID REFERENCES orders(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  helpful_count INT DEFAULT 0,
  images VARCHAR(500)[], -- Array of image URLs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_menu_item_id ON reviews(menu_item_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

---

### 15. WISHLIST TABLE
```sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wishlist_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlist_restaurant_id ON wishlists(restaurant_id);
```

---

### 16. COUPONS & PROMO CODES TABLE
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'fixed_amount', 'free_delivery') DEFAULT 'percentage',
  discount_value DECIMAL(8,2) NOT NULL,
  max_discount DECIMAL(10,2),
  min_order_value DECIMAL(10,2),
  max_uses INT, -- -1 for unlimited
  uses_count INT DEFAULT 0,
  usage_limit_per_user INT DEFAULT 1,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  applicable_restaurants VARCHAR(500)[], -- NULL for all
  applicable_cuisines VARCHAR(500)[], -- NULL for all
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promos_code ON promo_codes(code);
CREATE INDEX idx_promos_valid_until ON promo_codes(valid_until);
```

---

### 17. DELIVERY_PARTNERS TABLE
```sql
CREATE TABLE delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  vehicle_type ENUM('bike', 'scooter', 'car') DEFAULT 'bike',
  vehicle_number VARCHAR(20),
  current_latitude DECIMAL(10,8),
  current_longitude DECIMAL(11,8),
  is_available BOOLEAN DEFAULT true,
  current_order_id UUID REFERENCES orders(id),
  total_deliveries INT DEFAULT 0,
  rating DECIMAL(3,2),
  phone_verified BOOLEAN DEFAULT false,
  documents_verified BOOLEAN DEFAULT false,
  bank_account_added BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_user_id ON delivery_partners(user_id);
CREATE INDEX idx_delivery_is_available ON delivery_partners(is_available);
```

---

### 18. DELIVERY_TRACKING TABLE
```sql
CREATE TABLE delivery_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  delivery_partner_id UUID REFERENCES delivery_partners(id),
  status ENUM('assigned', 'on_the_way', 'arrived', 'completed', 'failed') DEFAULT 'assigned',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  estimated_arrival_time TIMESTAMP,
  actual_arrival_time TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracking_order_id ON delivery_tracking(order_id);
CREATE INDEX idx_tracking_delivery_partner_id ON delivery_tracking(delivery_partner_id);
```

---

### 19. PAYMENT_TRANSACTIONS TABLE
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  user_id UUID NOT NULL REFERENCES users(id),
  payment_method ENUM('card', 'upi', 'wallet', 'cash_on_delivery'),
  amount DECIMAL(10,2) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  external_gateway_ref VARCHAR(500), -- Stripe, Razorpay reference
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  refunded_at TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payments_user_id ON payment_transactions(user_id);
```

---

### 20. USER_PREFERENCES TABLE
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_cuisines VARCHAR(500)[], -- JSON array
  dietary_restrictions VARCHAR(500)[], -- Vegetarian, vegan, gluten-free, etc.
  spice_preference INT, -- 0-5
  price_preference ENUM('budget', 'moderate', 'premium'),
  notification_preferences JSON, -- Which notifications to enable
  theme_preference ENUM('light', 'dark', 'auto') DEFAULT 'auto',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_preferences_user_id ON user_preferences(user_id);
```

---

## API ENDPOINTS

### Authentication & User Management

#### 1. Sign Up
```
POST /api/auth/signup
Body: {
  email: string,
  phone: string,
  password: string,
  latitude: number,
  longitude: number,
  address: string,
  city: string
}
Response: {
  user: User,
  token: string,
  refreshToken: string
}
```

#### 2. Login
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  user: User,
  token: string,
  refreshToken: string
}
```

#### 3. Get User Profile
```
GET /api/users/profile
Headers: { Authorization: "Bearer {token}" }
Response: User (with all details)
```

#### 4. Update User Profile
```
PATCH /api/users/profile
Headers: { Authorization: "Bearer {token}" }
Body: Partial User object
Response: Updated User
```

#### 5. Add/Update Address
```
POST /api/users/addresses
Headers: { Authorization: "Bearer {token}" }
Body: {
  address_line1: string,
  address_line2?: string,
  city: string,
  state: string,
  postal_code: string,
  latitude: number,
  longitude: number,
  address_type: "home" | "work" | "other",
  is_default: boolean
}
Response: Address object
```

#### 6. Get User Addresses
```
GET /api/users/addresses
Headers: { Authorization: "Bearer {token}" }
Response: Address[]
```

---

### Restaurants & Menus

#### 7. Get All Restaurants
```
GET /api/restaurants?
  latitude=40.7128&
  longitude=-74.0060&
  radius=5&
  cuisine=Italian&
  min_rating=4&
  sort=rating|distance|delivery_time
Response: Restaurant[] (paginated)
```

#### 8. Get Restaurant Details
```
GET /api/restaurants/{id}
Response: Restaurant (with reviews, menu items)
```

#### 9. Get Restaurant Menu
```
GET /api/restaurants/{id}/menu
Response: {
  menus: [
    {
      name: string,
      items: MenuItem[]
    }
  ]
}
```

#### 10. Search Restaurants
```
GET /api/restaurants/search?q=pizza&latitude=40.7128&longitude=-74.0060
Response: Restaurant[]
```

#### 11. Get Featured/Trending Restaurants
```
GET /api/restaurants/featured
Response: Restaurant[]
```

---

### Menu Items

#### 12. Get Menu Item Details
```
GET /api/menu-items/{id}
Response: MenuItem (with reviews, modifiers, available deals)
```

#### 13. Search Menu Items
```
GET /api/menu-items/search?q=pizza&restaurant_id=xxx&mood=spicy
Response: MenuItem[]
```

#### 14. Get Items by Mood
```
GET /api/menu-items/by-mood?mood=comfort|spicy|healthy|party&latitude=40.7128&longitude=-74.0060
Response: MenuItem[] (grouped by restaurant)
```

---

### Deals

#### 15. Get All Available Deals
```
GET /api/deals?latitude=40.7128&longitude=-74.0060&sort=discount_value|expires_at
Response: Deal[]
```

#### 16. Get Restaurant Deals
```
GET /api/restaurants/{id}/deals
Response: Deal[]
```

#### 17. Get Leftover Deals
```
GET /api/deals/leftover?latitude=40.7128&longitude=-74.0060
Response: Deal[] (sorted by expiry time)
```

---

### Orders

#### 18. Create Order
```
POST /api/orders
Headers: { Authorization: "Bearer {token}" }
Body: {
  restaurant_id: uuid,
  items: [
    {
      menu_item_id: uuid,
      quantity: number,
      modifiers: Modifier[],
      special_instructions?: string
    }
  ],
  delivery_address_id: uuid,
  special_instructions?: string,
  promo_code?: string,
  payment_method: "card" | "upi" | "wallet" | "cash_on_delivery"
}
Response: Order
```

#### 19. Get Order Details
```
GET /api/orders/{id}
Headers: { Authorization: "Bearer {token}" }
Response: Order (with items, tracking, payment details)
```

#### 20. Get User Orders
```
GET /api/orders?status=all|pending|delivered&sort=recent|oldest
Headers: { Authorization: "Bearer {token}" }
Response: Order[] (paginated)
```

#### 21. Cancel Order
```
POST /api/orders/{id}/cancel
Headers: { Authorization: "Bearer {token}" }
Body: { reason: string }
Response: { success: boolean, message: string }
```

#### 22. Track Order
```
GET /api/orders/{id}/tracking
Headers: { Authorization: "Bearer {token}" }
Response: {
  order_id: uuid,
  status: string,
  estimated_arrival: timestamp,
  delivery_partner: {
    name: string,
    phone: string,
    vehicle: string,
    latitude: number,
    longitude: number
  },
  current_location: { latitude, longitude }
}
```

---

### Budget Mode

#### 23. Get Meals Within Budget
```
GET /api/budget-mode?
  budget=500&
  latitude=40.7128&
  longitude=-74.0060&
  dietary_restrictions=vegetarian&
  sort=price|rating
Response: {
  meals: [
    {
      restaurant: Restaurant,
      items: MenuItem[],
      total_price: number
    }
  ]
}
```

---

### Group Orders

#### 24. Create Group Order
```
POST /api/group-orders
Headers: { Authorization: "Bearer {token}" }
Body: {
  restaurant_id: uuid,
  delivery_address_id: uuid,
  deadline: timestamp,
  split_type: "equal" | "itemwise"
}
Response: {
  group_order: GroupOrder,
  share_code: string,
  share_url: string
}
```

#### 25. Join Group Order
```
POST /api/group-orders/{code}/join
Headers: { Authorization: "Bearer {token}" }
Response: GroupOrder
```

#### 26. Add Item to Group Order
```
POST /api/group-orders/{code}/items
Headers: { Authorization: "Bearer {token}" }
Body: {
  menu_item_id: uuid,
  quantity: number,
  modifiers: Modifier[],
  special_instructions?: string
}
Response: GroupOrder
```

#### 27. Get Group Order Details
```
GET /api/group-orders/{code}
Headers: { Authorization: "Bearer {token}" }
Response: GroupOrder (with members and items)
```

#### 28. Close & Submit Group Order
```
POST /api/group-orders/{id}/submit
Headers: { Authorization: "Bearer {token}" }
Response: Order (main order created)
```

---

### Reviews & Ratings

#### 29. Create Review
```
POST /api/reviews
Headers: { Authorization: "Bearer {token}" }
Body: {
  order_id?: uuid,
  restaurant_id?: uuid,
  menu_item_id?: uuid,
  rating: 1-5,
  title?: string,
  review_text: string,
  images?: string[] (base64 or URLs)
}
Response: Review
```

#### 30. Get Reviews
```
GET /api/reviews?
  restaurant_id=xxx OR
  menu_item_id=xxx&
  sort=recent|helpful|rating
Response: Review[]
```

---

### Wishlist

#### 31. Add to Wishlist
```
POST /api/wishlist
Headers: { Authorization: "Bearer {token}" }
Body: {
  menu_item_id: uuid,
  restaurant_id: uuid
}
Response: { success: boolean }
```

#### 32. Get Wishlist
```
GET /api/wishlist
Headers: { Authorization: "Bearer {token}" }
Response: MenuItem[]
```

#### 33. Remove from Wishlist
```
DELETE /api/wishlist/{menu_item_id}
Headers: { Authorization: "Bearer {token}" }
Response: { success: boolean }
```

---

### Promotions & Coupons

#### 34. Validate Promo Code
```
POST /api/promo-codes/validate
Headers: { Authorization: "Bearer {token}" }
Body: {
  code: string,
  subtotal: number,
  restaurant_id?: uuid
}
Response: {
  valid: boolean,
  discount_amount: number,
  discount_type: string,
  message: string
}
```

#### 35. Get Available Promos
```
GET /api/promo-codes?restaurant_id=xxx
Response: PromoCode[]
```

---

### Delivery Partners

#### 36. Get Delivery Status (Realtime with WebSocket)
```
WS /api/orders/{id}/delivery-ws
Message format: {
  type: "location_update" | "status_change" | "eta_update",
  data: { latitude, longitude, status, eta }
}
```

---

## Key Business Logic

### 1. Budget Mode Algorithm
- Filter restaurants by user's city/location
- Get all menu items for each restaurant
- Use dynamic programming/knapsack to find valid meal combinations within budget
- Consider dietary restrictions and preferences
- Return optimized combinations sorted by rating

### 2. Group Order Split Logic
```javascript
// Equal split
per_person_cost = total_amount / members.length

// Itemwise split
per_person_cost = sum(items_ordered_by_person) + (delivery_fee / members.length)
```

### 3. Distance Calculation
```javascript
// Haversine formula
distance = 2 * R * asin(sqrt(sin²((lat2-lat1)/2) + cos(lat1) * cos(lat2) * sin²((lng2-lng1)/2)))
// R = 6371 km (Earth's radius)
```

### 4. AI Mood-Based Recommendations
```javascript
// Mood mappings:
Comfort: high-calorie, indulgent items, comfort_tag = true
Spicy: spice_level >= 3
Healthy: is_vegan OR is_vegetarian, calories <= 500, health_tag = true
Party: affordable, popular, bestseller_tag = true, allows_sharing
```

### 5. Leftover Deal Urgency
```javascript
urgency_score = (1 - (time_remaining / total_deal_duration)) * 100
// Sort deals by urgency_score DESC and expires_at ASC
```

---

## Data Relationships

```
User (1) ──→ (M) User_Addresses
User (1) ──→ (M) Orders
User (1) ──→ (M) Reviews
User (1) ──→ (M) Wishlists
User (1) ──→ (M) GroupOrders (as creator)
User (1) ──→ (M) GroupOrderMembers
User (1) ──→ (1) UserPreferences

Restaurant (1) ──→ (M) MenuItems
Restaurant (1) ──→ (M) RestaurantMenus
Restaurant (1) ──→ (M) Orders
Restaurant (1) ──→ (M) Deals
Restaurant (1) ──→ (M) Reviews

RestaurantMenu (1) ──→ (M) MenuItems
MenuItem (1) ──→ (M) MenuItemModifiers
MenuItem (1) ──→ (M) Reviews
MenuItem (1) ──→ (M) Wishlists

MenuItemModifier (1) ──→ (M) ModifierOptions

Order (1) ──→ (M) OrderItems
Order (1) ──→ (1) PaymentTransaction
Order (1) ──→ (1) DeliveryTracking

GroupOrder (1) ──→ (M) GroupOrderMembers
GroupOrder (1) ──→ (M) GroupOrderItems
GroupOrderMember (1) ──→ (M) GroupOrderItems
```

---

## Security Considerations

### 1. Authentication
- JWT tokens with 15min expiry for access, 7 days for refresh
- bcrypt password hashing with salt rounds = 12
- Two-factor authentication (OTP via SMS for phone-verified users)

### 2. Authorization
- Role-based access control (User, Restaurant Admin, Delivery Partner, Admin)
- Row-level security: Users can only see/modify their own data
- Rate limiting: 100 requests/minute per IP, 500 per authenticated user

### 3. Payment Security
- PCI DSS compliance (use payment gateway, never store raw card data)
- Tokenization for saved cards
- 3D Secure for card payments
- Webhook signature verification for payment confirmations

### 4. Data Privacy
- GDPR compliance for EU users
- Encrypt sensitive data in transit (HTTPS)
- Encrypt PII at rest (phone numbers, addresses)
- Audit logs for all data access

---

## Caching Strategy

```
Cache Layer: Redis
- Restaurant list by city: TTL 1 hour
- Menu items: TTL 30 minutes
- Deals/Promos: TTL 5 minutes
- User orders: TTL 2 minutes (frequent updates)
- Menu item ratings: TTL 1 hour
- Deal expiry: Real-time updates (no cache)
```

---

## Notification System

### Channels
- Email (order confirmation, delivery updates)
- SMS (OTP, order status, delivery ETA)
- Push notifications (mobile app, web)
- In-app notifications

### Events
- Order confirmed
- Order preparation started
- Out for delivery
- Delivered
- Promotional deals near expiry
- Restaurant reopens after closing
- Group order deadline approaching
- Payment failed

---

## Performance Optimization

### Database
- Connection pooling (min 10, max 50 connections)
- Query optimization with proper indexes
- Pagination: 20 items per page by default
- Lazy loading for restaurant images

### API
- Response caching (HTTP Cache headers)
- Compression (gzip)
- CDN for static assets
- API versioning: /api/v1/, /api/v2/, etc.

### Frontend
- Image optimization (WebP, lazy loading)
- Code splitting and route-based loading
- Memoization for expensive computations
- Service workers for offline support

---

## Testing Strategy

### Unit Tests
- User authentication logic
- Budget calculation algorithm
- Distance calculation
- Price computation with discounts

### Integration Tests
- Order creation flow
- Group order member management
- Payment processing
- Notification delivery

### E2E Tests
- Complete order flow (browse → order → delivery → review)
- Group order creation and submission
- Budget mode meal selection
- Deal application

---

## Future Enhancements

1. **AI Personalization**: ML model for restaurant/menu recommendations
2. **Social Features**: Share meals, follow restaurants, friend recommendations
3. **Loyalty Program**: Points system, rewards, tier-based benefits
4. **Subscription Model**: Premium membership for discounts
5. **Multi-vendor Support**: Third-party restaurants can integrate via API
6. **Real-time Inventory**: Sync with restaurant POS systems
7. **Dynamic Pricing**: Surge pricing during peak hours
8. **Route Optimization**: Multi-stop delivery optimization for delivery partners
9. **Carbon Footprint Tracking**: Environmental impact of food choices
10. **Voice Ordering**: Voice assistant integration

---

## Deployment Checklist

- [ ] Database migration and schema setup
- [ ] API endpoint implementation and testing
- [ ] Authentication and authorization setup
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Email service setup (SendGrid/AWS SES)
- [ ] SMS service setup (Twilio)
- [ ] Redis cache setup
- [ ] CDN configuration
- [ ] Monitoring and alerting (DataDog/NewRelic)
- [ ] Load testing (1000+ concurrent users)
- [ ] Security audit and penetration testing
- [ ] Backup and disaster recovery setup
- [ ] CI/CD pipeline configuration
- [ ] Production deployment and monitoring
