'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useFavorites } from '@/app/contexts/FavoritesContext';
import { Navbar } from '@/components/navbar';
import { RestaurantCard } from '@/components/restaurant-card';
import { FoodCard } from '@/components/food-card';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants');

  // Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/favorites');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter restaurants/menuItems
  const favoriteRestaurants = favorites
    .filter((f) => f.restaurantId && f.restaurant)
    .map((f) => f.restaurant!);

  const favoriteMenuItems = favorites
    .filter((f) => f.menuItemId && f.menuItem)
    .map((f) => ({
      ...f.menuItem!,
      restaurantName: f.menuItem?.restaurant?.name || 'Restaurant',
    }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header Banner */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 md:p-8 mb-8 relative overflow-hidden shadow-sm">
          <div className="absolute right-6 bottom-0 translate-y-1/4 translate-x-1/12 opacity-10 text-9xl">❤️</div>
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
                <Heart className="h-8 w-8 fill-rose-500 text-rose-500" />
                My Favorites
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                Quick access to your preferred dining places and go-to menu combinations.
              </p>
            </div>
            <Link href="/restaurants">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1">
                <Sparkles className="h-4 w-4" /> Explore New
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 border-b border-border pb-3 mb-6">
          <Button
            variant={activeTab === 'restaurants' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('restaurants')}
            className={`font-semibold ${activeTab === 'restaurants' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            Saved Restaurants ({favoriteRestaurants.length})
          </Button>
          <Button
            variant={activeTab === 'dishes' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('dishes')}
            className={`font-semibold ${activeTab === 'dishes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            Go-To Dishes ({favoriteMenuItems.length})
          </Button>
        </div>

        {/* Loading Spinner */}
        {favoritesLoading && favorites.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeTab === 'restaurants' ? (
          /* Restaurants Tab */
          favoriteRestaurants.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No saved restaurants</h2>
              <p className="text-muted-foreground mb-6">Tap the heart icon on any restaurant card to save it here.</p>
              <Link href="/restaurants">
                <Button className="bg-primary text-primary-foreground">Find Restaurants</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fadeIn">
              {favoriteRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )
        ) : (
          /* Dishes Tab */
          favoriteMenuItems.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No saved dishes</h2>
              <p className="text-muted-foreground mb-6">Tap the heart icon on menu dishes to save them here for instant checkout.</p>
              <Link href="/restaurants">
                <Button className="bg-primary text-primary-foreground">Explore Menus</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fadeIn">
              {favoriteMenuItems.map((menuItem) => (
                <FoodCard
                  key={menuItem.id}
                  item={menuItem as any}
                  restaurantName={menuItem.restaurantName}
                />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
