# API Integration Guide

This guide shows how to integrate the FoodHub frontend with the Node.js + Express backend.

## Quick Start

### 1. Set Environment Variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Update the API URL in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
# For production:
# NEXT_PUBLIC_API_URL=https://api.foodhub.app/api
```

### 2. Using the API Service Layer

The app includes pre-built API services in `lib/api-services.ts` that handle all API calls. Each service module is organized by feature:

```typescript
// Import services as needed
import {
  restaurantService,
  authService,
  orderService,
  dealService,
} from '@/lib/api-services';
```

## Data Fetching Patterns

### Pattern 1: Basic Data Fetching with useApi Hook

For GET requests in components:

```typescript
'use client';

import { useApi } from '@/hooks/use-api';
import { restaurantService } from '@/lib/api-services';

export default function RestaurantsPage() {
  const { data: restaurants, loading, error } = useApi(
    () => restaurantService.getRestaurants({ city: 'New York' }),
    ['New York'] // dependencies
  );

  if (loading) return <div>Loading restaurants...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {restaurants?.map((restaurant) => (
        <div key={restaurant.id}>{restaurant.name}</div>
      ))}
    </div>
  );
}
```

### Pattern 2: Mutations (POST, PUT, DELETE) with useMutation Hook

For creating/updating data:

```typescript
'use client';

import { useMutation } from '@/hooks/use-api';
import { orderService } from '@/lib/api-services';

export default function CheckoutPage() {
  const { mutate: createOrder, loading, error } = useMutation(
    (orderData) => orderService.createOrder(orderData)
  );

  const handleCheckout = async () => {
    try {
      const result = await createOrder({
        restaurantId: 'uuid',
        items: [...],
        addressId: 'uuid',
      });
      console.log('Order created:', result);
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Processing...' : 'Checkout'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### Pattern 3: Pagination with usePagination Hook

For paginated lists:

```typescript
'use client';

import { usePagination } from '@/hooks/use-api';
import { restaurantService } from '@/lib/api-services';

export default function RestaurantListPage() {
  const {
    data: restaurants,
    page,
    totalPages,
    loading,
    nextPage,
    prevPage,
  } = usePagination(
    (pageNum) =>
      restaurantService.getRestaurants({
        page: pageNum,
        limit: 10,
        city: 'New York',
      }),
    10
  );

  return (
    <div>
      {restaurants.map((r) => (
        <div key={r.id}>{r.name}</div>
      ))}

      <div className="mt-4 flex gap-2">
        <button onClick={prevPage} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
```

### Pattern 4: Infinite Scroll with useInfiniteQuery Hook

For infinite scroll pagination:

```typescript
'use client';

import { useInfiniteQuery } from '@/hooks/use-api';
import { dealService } from '@/lib/api-services';
import { useEffect, useRef, useCallback } from 'react';

export default function DealsPage() {
  const { data: deals, loading, hasMore, loadMore } = useInfiniteQuery(
    (page) => dealService.getDeals({ page, limit: 10, city: 'New York' }),
    10
  );

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <div>
      {deals.map((deal) => (
        <div key={deal.id}>{deal.itemName}</div>
      ))}

      {hasMore && (
        <div ref={observerTarget} className="py-8">
          {loading && <p>Loading more deals...</p>}
        </div>
      )}
    </div>
  );
}
```

## Authentication Flow

### Login/Signup Integration

```typescript
'use client';

import { authService } from '@/lib/api-services';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.login(email, password);

    if (result.success) {
      // Save token to localStorage
      localStorage.setItem('authToken', result.data.authToken);

      // Redirect to home
      router.push('/');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

### Protected Routes with Auth Check

```typescript
'use client';

import { useApi } from '@/hooks/use-api';
import { authService } from '@/lib/api-services';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const router = useRouter();
  const { data: profile, loading, error } = useApi(
    () => authService.getProfile(),
    []
  );

  useEffect(() => {
    // If no auth token, redirect to login
    if (!loading && error) {
      router.push('/auth');
    }
  }, [loading, error, router]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return null;

  return <div>Welcome, {profile.firstName}!</div>;
}
```

## Error Handling

The API client automatically handles errors and returns them in a consistent format:

```typescript
import { useMutation } from '@/hooks/use-api';

const { mutate, loading, error } = useMutation(async (data) => {
  return someApiCall(data);
});

// Error object structure
if (error) {
  console.log(error);
  // "Unauthorized - Token required or invalid"
  // "Validation failed"
  // "Resource not found"
}
```

## Converting Existing Mock Data Pages

### Before (Using Mock Data):

```typescript
import { restaurants } from '@/lib/mock-data';

export default function RestaurantsPage() {
  return (
    <div>
      {restaurants.map((r) => (
        <RestaurantCard key={r.id} restaurant={r} />
      ))}
    </div>
  );
}
```

### After (Using Real API):

```typescript
'use client';

import { useApi } from '@/hooks/use-api';
import { restaurantService } from '@/lib/api-services';

export default function RestaurantsPage() {
  const { data: restaurants, loading, error } = useApi(
    () => restaurantService.getRestaurants({ city: 'New York' }),
    []
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      {restaurants?.map((r) => (
        <RestaurantCard key={r.id} restaurant={r} />
      ))}
    </div>
  );
}
```

## Caching & Optimization

### Prevent Unnecessary Re-fetches

The `useApi` hook caches results based on dependencies:

```typescript
// This will only fetch once on mount
const { data } = useApi(
  () => restaurantService.getRestaurants({ city: 'New York' }),
  [] // empty dependency array = fetch only once
);

// This will refetch whenever city changes
const { data } = useApi(
  () => restaurantService.getRestaurants({ city }),
  [city] // refetch when city changes
);
```

### Retry Logic

The `useApi` hook includes automatic retry with exponential backoff:

```typescript
const { data, error } = useApi(
  () => restaurantService.getRestaurants(),
  [],
  { retryCount: 3 } // Retry up to 3 times
);
```

## Handling File Uploads

For features like profile picture uploads, use FormData:

```typescript
async function uploadProfilePicture(file: File) {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/profile/picture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    }
  );

  return response.json();
}
```

## WebSocket/Real-time Updates

For real-time features like order tracking:

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function OrderTracking({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Connect to WebSocket (if backend supports it)
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/orders/${orderId}/track`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.status);
    };

    return () => ws.close();
  }, [orderId]);

  return <div>Order Status: {status}</div>;
}
```

## Testing API Calls

### Example test with mock service:

```typescript
import { restaurantService } from '@/lib/api-services';

// Mock the fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => ({
      success: true,
      data: [{ id: '1', name: 'Test Restaurant' }],
    }),
  })
);

test('getRestaurants returns data', async () => {
  const result = await restaurantService.getRestaurants({ city: 'New York' });
  expect(result.success).toBe(true);
  expect(result.data).toHaveLength(1);
});
```

## Best Practices

1. **Always handle loading states** - Show spinners or skeleton screens
2. **Display error messages** - Help users understand what went wrong
3. **Use proper TypeScript types** - Import types from `lib/types.ts`
4. **Batch requests** - Don't make redundant API calls
5. **Implement debouncing** - For search/filter operations
6. **Use localStorage for auth token** - Persist across page refreshes
7. **Add request timeouts** - Prevent hanging requests
8. **Log errors** - For debugging in production

## Troubleshooting

### "CORS Error"
- Ensure backend has CORS enabled for your frontend URL
- Check `NEXT_PUBLIC_API_URL` is correct

### "401 Unauthorized"
- Token might be expired
- Verify token is saved in localStorage
- Check Authorization header format: `Bearer <token>`

### "Network Error"
- Check if backend server is running
- Verify backend is listening on correct port (default: 5000)
- Check network tab in browser DevTools

### Slow API Responses
- Check backend performance
- Consider implementing caching
- Use pagination for large datasets
- Monitor database queries
