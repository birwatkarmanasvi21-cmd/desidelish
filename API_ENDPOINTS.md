# FoodHub REST API Endpoints

## Base URL
```
http://localhost:5000/api
```

Environment variable: `NEXT_PUBLIC_API_URL`

---

## Authentication Endpoints

### POST /auth/signup
Register a new user account.

**Request:**
```json
{
  "email": "user@gmail.com",
  "phone": "9876543210",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "phone": "9876543210",
    "authToken": "jwt_token_here"
  }
}
```

---

### POST /auth/login
Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "user@gmail.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "authToken": "jwt_token_here",
    "expiresIn": 86400
  }
}
```

---

### POST /auth/logout
Logout user and invalidate token.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /auth/profile
Get authenticated user's profile.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "phone": "9876543210",
    "firstName": "John",
    "lastName": "Doe",
    "profilePictureUrl": "url",
    "totalOrders": 5,
    "totalSpent": 500.50,
    "rating": 4.5,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### PUT /auth/profile
Update user profile information.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "profilePictureUrl": "url"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", "firstName": "John" }
}
```

---

## User Address Endpoints

### POST /users/addresses
Add a new address for user.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "addressType": "home",
  "isDefault": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "uuid", "city": "New York", "isDefault": true }
}
```

---

### GET /users/addresses
Get all addresses for user.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "addressLine1": "123 Main St",
      "city": "New York",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "isDefault": true
    }
  ]
}
```

---

### PUT /users/addresses/:addressId
Update an address.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", "addressLine1": "Updated Address" }
}
```

---

### DELETE /users/addresses/:addressId
Delete an address.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (204):**
Empty response

---

### PUT /users/addresses/:addressId/default
Set address as default delivery address.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Address set as default"
}
```

---

## Restaurant Endpoints

### GET /restaurants
Get list of restaurants with optional filtering and pagination.

**Query Parameters:**
- `city` - Filter by city (required)
- `cuisine` - Filter by cuisine type
- `minRating` - Minimum rating (0-5)
- `maxDeliveryFee` - Maximum delivery fee
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Request:**
```
GET /restaurants?city=New%20York&minRating=4&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Pizza Palace",
      "description": "Best pizza in town",
      "logoUrl": "url",
      "cuisines": ["Italian", "Pizza"],
      "rating": 4.5,
      "reviewCount": 120,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "deliveryFee": 2.5,
      "deliveryTimeMin": 30,
      "deliveryTimeMax": 45,
      "minOrder": 15.00,
      "isOpen": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### GET /restaurants/search
Search restaurants by name.

**Query Parameters:**
- `q` - Search query (required)

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Pizza Palace", "rating": 4.5 }
  ]
}
```

---

### GET /restaurants/:restaurantId
Get detailed information about a specific restaurant.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Pizza Palace",
    "description": "Best pizza in town",
    "logoUrl": "url",
    "bannerImageUrl": "url",
    "cuisines": ["Italian", "Pizza"],
    "rating": 4.5,
    "address": "123 Main St, New York, NY 10001",
    "openingHours": {
      "monday": { "opens": "10:00", "closes": "22:00" },
      "tuesday": { "opens": "10:00", "closes": "22:00" }
    },
    "menus": [
      {
        "id": "uuid",
        "name": "Breakfast",
        "displayOrder": 1
      }
    ]
  }
}
```

---

### GET /restaurants/nearby
Get restaurants near user location.

**Query Parameters:**
- `latitude` - User latitude (required)
- `longitude` - User longitude (required)
- `radius` - Search radius in km (default: 5)

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Pizza Palace", "distance": 2.3 }
  ]
}
```

---

## Menu Endpoints

### GET /restaurants/:restaurantId/menu
Get all menus for a restaurant.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Breakfast",
      "description": "Morning items",
      "displayOrder": 1
    }
  ]
}
```

---

### GET /restaurants/:restaurantId/menu/:menuId/items
Get all items in a specific menu.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Margherita Pizza",
      "description": "Fresh mozzarella and basil",
      "imageUrl": "url",
      "price": 12.99,
      "rating": 4.8,
      "reviewCount": 45,
      "prepTime": 20,
      "vegetarian": true,
      "spiceLevel": 1,
      "mood": "comfort"
    }
  ]
}
```

---

### GET /menu-items/mood/:mood
Get menu items filtered by mood.

**Path Parameters:**
- `mood` - One of: `comfort`, `spicy`, `healthy`, `party`

**Query Parameters:**
- `restaurantId` - Filter by specific restaurant (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Spicy Curry", "mood": "spicy", "price": 10.99 }
  ]
}
```

---

### GET /menu-items/search
Search for specific menu items.

**Query Parameters:**
- `q` - Search query (required)

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Margherita Pizza", "restaurantId": "uuid" }
  ]
}
```

---

## Order Endpoints

### POST /orders
Create a new order.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "restaurantId": "uuid",
  "addressId": "uuid",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "modifiers": [
        { "name": "Extra cheese", "price": 1.50 }
      ]
    }
  ],
  "promoCode": "SAVE10",
  "specialInstructions": "No onions"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD123456",
    "status": "confirmed",
    "subtotal": 35.98,
    "deliveryFee": 2.50,
    "tax": 3.24,
    "total": 41.72,
    "estimatedDeliveryTime": "2024-01-15T14:45:00Z"
  }
}
```

---

### GET /orders
Get user's orders.

**Headers:** 
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Filter by status (confirmed, preparing, on-the-way, delivered, cancelled)
- `limit` - Items per page (default: 10)
- `page` - Page number (default: 1)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD123456",
      "restaurantName": "Pizza Palace",
      "total": 41.72,
      "status": "delivered",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

---

### GET /orders/:orderId
Get order details.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD123456",
    "restaurantId": "uuid",
    "items": [
      {
        "menuItemId": "uuid",
        "name": "Margherita Pizza",
        "quantity": 2,
        "price": 12.99,
        "subtotal": 25.98
      }
    ],
    "status": "delivered",
    "timeline": [
      { "status": "confirmed", "timestamp": "2024-01-15T12:00:00Z" },
      { "status": "delivered", "timestamp": "2024-01-15T12:45:00Z" }
    ]
  }
}
```

---

### PUT /orders/:orderId/cancel
Cancel an order (only if not yet prepared).

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "reason": "Changed my mind"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", "status": "cancelled" }
}
```

---

### GET /orders/:orderId/track
Track order in real-time.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "status": "on-the-way",
    "estimatedArrival": "2024-01-15T12:45:00Z",
    "driverLocation": { "latitude": 40.7580, "longitude": -73.9855 },
    "driverName": "John",
    "driverRating": 4.8
  }
}
```

---

### POST /orders/:orderId/review
Submit a review for completed order.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "rating": 5,
  "comment": "Great pizza!",
  "itemRatings": [
    { "menuItemId": "uuid", "rating": 5 }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "uuid", "rating": 5 }
}
```

---

## Deals Endpoints

### GET /deals
Get available deals.

**Query Parameters:**
- `city` - Filter by city (required)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "itemName": "Margherita Pizza",
      "restaurantId": "uuid",
      "originalPrice": 14.99,
      "discountedPrice": 8.99,
      "discountPercentage": 40,
      "remainingInventory": 5,
      "expiresAt": "2024-01-15T18:00:00Z",
      "imageUrl": "url"
    }
  ]
}
```

---

### GET /deals/leftover/trending
Get trending leftover deals.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "itemName": "Margherita Pizza",
      "discountedPrice": 8.99,
      "remainingInventory": 3,
      "urgencyScore": 95
    }
  ]
}
```

---

### PUT /deals/:dealId/claim
Claim a deal and add to cart.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "dealId": "uuid", "claimedQuantity": 2 }
}
```

---

## Budget Mode Endpoints

### POST /budget-mode/calculate
Calculate meal combinations within a budget.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "budget": 25.00,
  "preferences": {
    "cuisines": ["Italian"],
    "restaurantId": "uuid"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "combination-1",
      "items": [
        {
          "menuItemId": "uuid",
          "name": "Margherita Pizza",
          "restaurantName": "Pizza Palace",
          "price": 12.99
        }
      ],
      "totalPrice": 24.50,
      "savings": 2.00
    }
  ]
}
```

---

### GET /budget-mode/suggestions
Get budget-based meal suggestions.

**Headers:** 
- `Authorization: Bearer <token>`

**Query Parameters:**
- `budget` - Budget amount (required)
- `city` - User city (required)

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "items": [], "totalPrice": 24.50 }
  ]
}
```

---

## Group Order Endpoints

### POST /group-orders
Create a new group order.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "restaurantId": "uuid",
  "groupName": "Team Lunch",
  "members": [
    {
      "email": "member1@example.com",
      "name": "John"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "shareLink": "https://foodhub.app/join/abc123",
    "expiresAt": "2024-01-15T20:00:00Z"
  }
}
```

---

### GET /group-orders/:groupOrderId
Get group order details.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "restaurantName": "Pizza Palace",
    "members": [
      {
        "userId": "uuid",
        "name": "John",
        "items": [
          { "menuItemId": "uuid", "name": "Pizza", "price": 12.99 }
        ],
        "subtotal": 25.98
      }
    ],
    "totalAmount": 51.96
  }
}
```

---

### POST /group-orders/:groupOrderId/invite
Invite a member to group order.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "email": "newmember@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation sent"
}
```

---

### POST /group-orders/:groupOrderId/add-item
Add item to your portion of group order.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "menuItemId": "uuid",
  "quantity": 2,
  "modifiers": []
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "itemId": "uuid", "quantity": 2 }
}
```

---

### GET /group-orders/:groupOrderId/split
Calculate bill split.

**Headers:** 
- `Authorization: Bearer <token>`

**Query Parameters:**
- `splitType` - equal | itemwise (default: equal)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalAmount": 51.96,
    "splitType": "equal",
    "splits": [
      {
        "userId": "uuid",
        "name": "John",
        "amount": 25.98
      }
    ]
  }
}
```

---

### POST /group-orders/:groupOrderId/checkout
Complete group order checkout.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "paymentMethodId": "uuid",
  "addressId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "status": "confirmed"
  }
}
```

---

## Review & Rating Endpoints

### GET /reviews
Get reviews for a restaurant.

**Query Parameters:**
- `restaurantId` - Restaurant ID (required)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "John",
      "rating": 5,
      "comment": "Great pizza!",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

---

### POST /reviews
Submit a review.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "restaurantId": "uuid",
  "orderId": "uuid",
  "rating": 5,
  "comment": "Amazing food!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "uuid", "rating": 5 }
}
```

---

## Wishlist Endpoints

### GET /wishlists
Get user's favorited restaurants.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Pizza Palace", "rating": 4.5 }
  ]
}
```

---

### POST /wishlists/:restaurantId/add
Add restaurant to wishlist.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Added to wishlist"
}
```

---

### DELETE /wishlists/:restaurantId/remove
Remove restaurant from wishlist.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (204):**
Empty response

---

## Promo & Coupon Endpoints

### POST /promos/validate
Validate a promo code.

**Headers:** 
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "code": "SAVE10",
  "orderValue": 50.00
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "code": "SAVE10",
    "discount": 5.00,
    "discountType": "fixed",
    "minOrderValue": 25.00
  }
}
```

---

### GET /promos/available
Get available promo codes for user.

**Headers:** 
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "code": "SAVE10",
      "description": "Save $10 on orders above $25",
      "discount": 10.00,
      "validUntil": "2024-12-31T23:59:59Z"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "data": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized - Token required or invalid"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Authentication
All endpoints marked with "Authorization: Bearer <token>" require:
- Valid JWT token in Authorization header
- Format: `Authorization: Bearer <your_token_here>`
- Token obtained from `/auth/login` or `/auth/signup`

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user

## Pagination
Default pagination parameters:
- `page`: 1 (starting page)
- `limit`: 10 (items per page)
- Max limit: 100

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```
