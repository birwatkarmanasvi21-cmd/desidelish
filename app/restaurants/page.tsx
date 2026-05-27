'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Filter, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RestaurantCard } from '@/components/restaurant-card';
import { FoodCard } from '@/components/food-card';
import { getRestaurants } from '@/lib/api';
import { Restaurant } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

export default function RestaurantsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        console.log('Fetching restaurants...');
        const data = await getRestaurants();
        console.log('Fetched restaurants:', data.length);
        setRestaurants(data);
        setError(null);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []); 

  // Filter Options
  const cuisineOptions = [
    'Indian',
    'Chinese',
    'Italian',
    'Pizza',
    'Burger',
    'Fast Food',
    'Healthy',
    'Street Food',
    'South Indian',
    'Desserts',
    'Comfort Food'
  ];

  // Collect matching items and filter restaurants
  const matchedDishes: any[] = [];
  
  const filtered = (restaurants || []).filter(r => {
    // 1. Search Query Filter
    let matchesSearch = true;
    if (searchQuery) {
      const moodTerms: string[] = [];
      if (searchQuery === 'comfort') moodTerms.push('dal khichdi', 'khichdi', 'soup', 'soups', 'rice', 'dessert', 'desserts', 'gulab jamun', 'rasgulla', 'rasmalai', 'kheer', 'curd rice');
      if (searchQuery === 'spicy') moodTerms.push('chicken', 'tandoori', 'tikka', 'kebab', 'korma', 'curry', 'spicy', 'biryani');
      if (searchQuery === 'healthy') moodTerms.push('salad', 'buddha bowl', 'smoothie', 'quinoa', 'vegan', 'healthy', 'sprouts', 'fruit bowl', 'wrap');
      if (searchQuery === 'party') moodTerms.push('burger', 'fries', 'sandwich', 'wrap', 'chaat', 'pav bhaji', 'pani puri', 'fast food');

      const allSearchTerms = [searchQuery, ...moodTerms];
      const isAnyTermMatch = (text: string) => {
        if (!text) return false;
        const normalized = String(text).toLowerCase();
        return allSearchTerms.some(term => normalized.includes(term.toLowerCase()));
      };

      const nameMatch = isAnyTermMatch(r.name);
      const descMatch = isAnyTermMatch(r.description || '');
      const cuisineStr = Array.isArray(r.cuisine) ? r.cuisine.join(',') : String(r.cuisine || '');
      const cuisineMatch = isAnyTermMatch(cuisineStr);
      
      const restaurantMatches: any[] = [];
      r.categories?.forEach(cat => {
        cat.menuItems?.forEach(item => {
          if (isAnyTermMatch(item.name) || (item.description && isAnyTermMatch(item.description)) || isAnyTermMatch(cat.name)) {
            restaurantMatches.push({ ...item, restaurantName: r.name, restaurantId: r.id });
          }
        });
      });

      if (restaurantMatches.length > 0) {
        matchedDishes.push(...restaurantMatches);
      }

      matchesSearch = nameMatch || descMatch || cuisineMatch || restaurantMatches.length > 0;
    }

    // 2. Cuisine Filter (Sidebar - OR logic)
    const matchesCuisine = selectedCuisine.length === 0 || selectedCuisine.some(c => {
      const rCuisine = String(r.cuisine || '').toLowerCase();
      return rCuisine.includes(c.toLowerCase());
    });

    // 3. Price Range Filter
    const matchesPrice = priceRange === null || Number(r.priceRange) === priceRange;

    // 4. Rating Filter
    const matchesRating = minRating === 0 || Number(r.rating) >= minRating;
    
    // FINAL COMBINATION - All filters must pass
    return matchesSearch && matchesCuisine && matchesPrice && matchesRating;
  }).sort((a, b) => {
    if (sortBy === 'rating') return Number(b.rating) - Number(a.rating);
    if (sortBy === 'delivery') return (a.deliveryTimeMin || 0) - (b.deliveryTimeMin || 0);
    return 0;
  });

  const clearFilters = () => {
    setSelectedCuisine([]);
    setPriceRange(null);
    setMinRating(0);
  };

  const hasActiveFilters = selectedCuisine.length > 0 || priceRange !== null || minRating > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <section className="border-b border-border bg-card py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">All Restaurants</h1>
          <p className="mt-2 text-muted-foreground">Discover amazing food from local restaurants</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-20 space-y-6">
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="font-semibold text-foreground">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filter Group - Cuisine */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Cuisine</h4>
                <div className="space-y-2">
                  {cuisineOptions.map((cuisine) => (
                    <label key={cuisine} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCuisine.includes(cuisine)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCuisine([...selectedCuisine, cuisine]);
                          } else {
                            setSelectedCuisine(selectedCuisine.filter(c => c !== cuisine));
                          }
                        }}
                        className="w-4 h-4 rounded border-border cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Group - Price */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Price Range</h4>
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((price) => (
                      <label key={price} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          checked={priceRange === price}
                          onChange={() => setPriceRange(priceRange === price ? null : price)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm text-muted-foreground">{'₹'.repeat(price)}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Filter Group - Rating */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Minimum Rating</h4>
                <div className="space-y-2">
                  {[0, 4, 4.5].map((rating) => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={minRating === rating}
                        onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">
                        {rating === 0 ? 'Any' : `${rating}+ stars`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {searchQuery ? `Search results for "${searchQuery}"` : 'All Restaurants'}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden gap-2"
                  onClick={() => setShowFilters(true)}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground pr-8 cursor-pointer focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="distance">Nearest</option>
                    <option value="delivery">Fastest Delivery</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Finding the best options for you...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-12 text-center">
                <p className="text-destructive font-medium mb-2">Error loading results</p>
                <p className="text-sm text-destructive/70">{error}</p>
                <Button variant="outline" className="mt-4 border-destructive/30 text-destructive" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {/* Matching Dishes Section */}
                {searchQuery && matchedDishes.length > 0 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold text-foreground">Matching Dishes</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {matchedDishes.map((dish, i) => (
                        <FoodCard 
                          key={`${dish.id}-${i}`} 
                          item={dish} 
                          restaurantName={dish.restaurantName}
                        />
                      ))}
                    </div>
                    <div className="border-b border-border pb-4" />
                  </div>
                )}

                {/* Restaurant Grid Section */}
                <div className="space-y-6">
                  {searchQuery && (
                    <h2 className="text-xl font-bold text-foreground">
                      {filtered.length > 0 ? 'Top Matching Restaurants' : ''}
                    </h2>
                  )}
                  
                  {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {filtered.map((restaurant) => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-card p-12 text-center">
                      <p className="text-muted-foreground">
                        {searchQuery 
                          ? `No restaurants found for "${searchQuery}".` 
                          : 'No restaurants match your filters.'}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
