# How to Edit Prices, Images & Items

## Overview
There are **two ways** to edit data:
1. **Development Mode** - Edit mock data directly in the code (fastest for testing)
2. **Production Mode** - Use the REST API endpoints from your Node.js backend

---

## Method 1: Edit Mock Data (Development)

### Location
File: `lib/mock-data.ts`

### Structure
Mock data is organized into three main exports:
- `restaurants` - Array of restaurant objects with menus
- `deals` - Array of deal objects
- `foodMoods` - Array of food mood categories

### How to Edit Prices

**Find the item you want to edit:**
```typescript
// In lib/mock-data.ts, find the restaurant and menu item
export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Urban Bites',
    menu: [
      {
        id: 'm1',
        name: 'Classic Burger',
        price: 12.99,  // ← CHANGE THIS
        // ... rest of item
      }
    ]
  }
]
```

**To change a price:**
1. Open `lib/mock-data.ts`
2. Find the restaurant by name or id
3. Find the menu item by name
4. Change the `price: number` value
5. Save and reload the page

**Example:**
```typescript
// Before
price: 12.99,

// After
price: 18.50,
```

**Note:** Prices are in USD. They'll automatically display as ₹ (multiplied by 83) in the UI.

---

### How to Edit Images

Images use Unsplash URLs. You can:

**Option A: Use a Different Unsplash URL**
```typescript
// Before
image: 'https://images.unsplash.com/photo-1568901346375-23c9450fc58e?w=400&h=300&fit=crop',

// After
image: 'https://images.unsplash.com/photo-1555939594-58d7cb561482?w=400&h=300&fit=crop',
```

**Option B: Use a Custom Image URL**
```typescript
image: 'https://your-cdn.com/burger.jpg',
```

**Option C: Use a Local Image File**
1. Save image to `public/images/` folder
2. Use: `image: '/images/burger.jpg'`

**Common Unsplash Image URLs:**
- Burgers: `photo-1568901346375-23c9450fc58e`
- Pizza: `photo-1604068549290-dea0e4a305ca`
- Salad: `photo-1546069901-ba9599a7e63c`
- Wings: `photo-1585618541340-51db8b15f2d3`
- Naan: `photo-1631048850919-f501c1d37cb0`
- Samosas: `photo-1601050690597-df0568f70950`
- Sushi: `photo-1579584425555-c3ce17fd4351`
- Pasta: `photo-1621996346565-e3dbc646d9a9`

---

### How to Add/Edit/Delete Menu Items

**Add a New Item:**
```typescript
// In the restaurant's menu array
menu: [
  // ... existing items
  {
    id: 'm99',           // Must be unique
    name: 'New Dish',    // Item name
    description: 'Description here',
    price: 11.99,        // Price in USD
    image: 'https://...',
    rating: 4.5,         // 0-5 rating
    category: 'Mains'    // Category name
  }
]
```

**Edit an Item:**
Just modify the properties in the object:
```typescript
{
  id: 'm1',
  name: 'Deluxe Burger',  // ← Changed
  description: 'Premium beef patty...',  // ← Changed
  price: 15.99,  // ← Changed
  image: 'https://...',
  rating: 4.8,  // ← Changed
  category: 'Burgers'
}
```

**Delete an Item:**
Remove the object from the menu array entirely.

---

### How to Add/Edit/Delete Restaurants

**Add a New Restaurant:**
```typescript
export const restaurants: Restaurant[] = [
  // ... existing restaurants
  {
    id: '10',
    name: 'New Restaurant',
    image: 'https://images.unsplash.com/...',
    rating: 4.6,
    distance: 1.5,
    deliveryTime: '20-25 mins',
    cuisine: ['Italian', 'Pasta'],
    priceRange: 2,
    isOpen: true,
    minOrder: 15,
    menu: [
      // Add menu items here
    ]
  }
]
```

**Edit a Restaurant:**
Modify properties like name, rating, distance, deliveryTime, etc.

**Delete a Restaurant:**
Remove the entire object from the `restaurants` array.

---

### How to Edit Deals

**Location:** Still in `lib/mock-data.ts`

```typescript
export const deals: Deal[] = [
  {
    id: 'd1',
    itemName: 'Spicy Samosas',  // ← Change item name
    restaurant: 'Spice Haven',   // ← Change restaurant
    originalPrice: 5.99,         // ← Change original price
    discountedPrice: 3.99,       // ← Change sale price
    discount: 33,                // ← Change discount % (auto-calculated ideally)
    image: 'https://...',        // ← Change image
    timeLeft: '2 hours',         // ← Change countdown time
    quantity: 15                 // ← Change available quantity
  }
]
```

---

## Method 2: Use REST API (Production)

### When to Use This
When your Node.js + Express backend is running, the app will:
1. Fetch real data from API endpoints
2. Update data through API calls
3. Persist changes to database

### Required Environment Variable
Create `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Or for production:
```
NEXT_PUBLIC_API_BASE_URL=https://your-production-api.com
```

### Key API Endpoints

**Get All Restaurants:**
```
GET /api/restaurants
```

**Get Restaurant by ID:**
```
GET /api/restaurants/:restaurantId
```

**Update Menu Item Price:**
```
PUT /api/restaurants/:restaurantId/menu/:itemId
Body: { price: 14.99 }
```

**Update Menu Item:**
```
PUT /api/restaurants/:restaurantId/menu/:itemId
Body: { 
  name: 'New Name',
  description: 'New description',
  price: 14.99,
  image: 'https://...',
  rating: 4.5
}
```

**Add Menu Item:**
```
POST /api/restaurants/:restaurantId/menu
Body: {
  name: 'New Item',
  description: 'Description',
  price: 12.99,
  image: 'https://...',
  category: 'Mains'
}
```

**Get All Deals:**
```
GET /api/deals
```

**Update Deal:**
```
PUT /api/deals/:dealId
Body: {
  originalPrice: 6.99,
  discountedPrice: 3.99,
  discount: 43
}
```

For more endpoints, see `API_ENDPOINTS.md`

---

## How Components Use This Data

### Components Using Mock Data
- `RestaurantCard` - Shows restaurant info (image, rating, distance, price range)
- `FoodCard` - Shows menu item (image, name, price, rating)
- `DealBadge` - Shows deal (image, original price, discounted price)

### Pages Using Mock Data
- `app/page.tsx` (Home) - Uses `restaurants` and `deals`
- `app/restaurants/page.tsx` - Uses `restaurants` array
- `app/restaurants/[id]/page.tsx` - Uses restaurant by ID
- `app/deals/page.tsx` - Uses `deals` array
- `app/budget-mode/page.tsx` - Uses `restaurants` for menu items

### How to Switch to API
Update imports in pages:
```typescript
// OLD: import from mock-data
import { restaurants, deals } from '@/lib/mock-data';

// NEW: Use API service
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-services';

export default function Page() {
  const { data: restaurants, isLoading } = useApi(
    () => api.restaurants.getAll()
  );
}
```

---

## Common Errors & Solutions

### Error: "Cannot find name 'price'" or Type Error
**Cause:** Missing or wrong property name
**Solution:** Check the interface in `lib/types.ts` for exact property names
```typescript
// Properties must match the interface:
interface MenuItem {
  id: string;      // ✓ Correct
  name: string;    // ✓ Correct
  price: number;   // ✓ NOT "Price" or "priceUSD"
  image: string;   // ✓ NOT "img" or "imageUrl"
}
```

### Error: "Image not loading or 404"
**Cause:** Invalid image URL
**Solution:** 
1. Test the image URL in browser first
2. Ensure URL is complete: `https://...`
3. Use Unsplash format: `https://images.unsplash.com/photo-XXXXX?w=400&h=300&fit=crop`

### Error: "NaN" or prices showing as "$undefined"
**Cause:** Price is not a number
**Solution:** Ensure price is:
```typescript
price: 12.99   // ✓ Correct (number)
price: "12.99" // ✗ Wrong (string)
price: null    // ✗ Wrong (null)
```

### Error: "Restaurant not found" or "404"
**Cause:** Restaurant ID doesn't match between references
**Solution:** 
- Check that `restaurantId` in cart items matches actual restaurant `id`
- Ensure all IDs are unique strings

---

## Quick Reference: File Paths

| What You Want | File to Edit |
|---|---|
| Edit restaurant info | `lib/mock-data.ts` → `restaurants` array |
| Edit menu items | `lib/mock-data.ts` → `restaurants[].menu` array |
| Edit prices | `lib/mock-data.ts` → `restaurant.menu[].price` |
| Edit images | `lib/mock-data.ts` → `restaurant.image` or `restaurant.menu[].image` |
| Edit deals | `lib/mock-data.ts` → `deals` array |
| Edit food moods | `lib/mock-data.ts` → `foodMoods` array |
| Configure API URL | `.env.local` → `NEXT_PUBLIC_API_BASE_URL` |

---

## Tips for Bulk Editing

**Use Find & Replace (Ctrl+H or Cmd+H):**
1. Open `lib/mock-data.ts`
2. Press Ctrl+H (Find & Replace)
3. Find: `price: 12.99,`
4. Replace with: `price: 15.99,`
5. Click "Replace All"

**Validate JSON Structure:**
After bulk edits, check for:
- Matching curly braces `{}`
- Matching square brackets `[]`
- Trailing commas in arrays
- All required properties present
