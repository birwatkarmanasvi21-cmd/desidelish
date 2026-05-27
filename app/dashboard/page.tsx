'use client';

import { useEffect, useState } from 'react';
import { Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RestaurantCard } from '@/components/restaurant-card';
import { FoodCard } from '@/components/food-card';
import { MoodButton } from '@/components/mood-button';
import Link from 'next/link';
import { foodMoods } from '@/lib/mock-data';
import { getRestaurants, getDeals, getRestaurantById } from '@/lib/api';
import { Restaurant, Deal, MenuItem } from '@/lib/types';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    if (!search.trim()) return;
    router.push(`/restaurants?search=${encodeURIComponent(search.trim())}`);
  };

  const handleSuggestion = () => {
    const suggestions = ['biryani', 'paneer', 'dosa', 'chaat', 'chicken', 'healthy'];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    router.push(`/restaurants?search=${random}`);
  };

  const handleMoodClick = (moodId: string) => {
    setSelectedMood(moodId);
    router.push(`/restaurants?search=${moodId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantsData, dealsData] = await Promise.all([
          getRestaurants(),
          getDeals()
        ]);
        setRestaurants(restaurantsData);
        setDeals(dealsData);

        // Fallback: If no dishes are found in deals, fetch the first restaurant's menu
        if (dealsData.length === 0 && restaurantsData.length > 0) {
          const firstRestaurant = await getRestaurantById(restaurantsData[0].id);
          if (firstRestaurant && firstRestaurant.categories) {
            const items = firstRestaurant.categories.flatMap(c => c.menuItems || []);
            setDeals(items.map(item => ({
              id: item.id,
              itemName: item.name,
              restaurant: firstRestaurant.name,
              discountedPrice: Number(item.price),
              image: item.imageUrl || '/placeholder-food.jpg',
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (item: MenuItem | any) => {
    // This would integrate with cart management in a real app
    console.log('Added to cart:', item);
  };

  const trendingRestaurants = restaurants.slice(0, 4);
  const popularDishes = deals.map(deal => ({
    id: deal.id,
    name: deal.itemName,
    description: `From ${deal.restaurant}`,
    price: deal.discountedPrice,
    image: deal.image,
    rating: 4.5, // Placeholder for dashboard
  })).slice(0, 6);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading amazing food for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
                  Welcome back, <span className="text-primary">{user?.firstName || user?.email?.split('@')[0] || 'User'}</span>!
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Discover amazing food with AI recommendations, budget-friendly options, and exclusive deals.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search restaurants or dishes..."
                    className="w-full rounded-xl border border-border bg-card pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                >
                  Search
                </Button>
              </div>

              {/* AI Button */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleSuggestion}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-6"
                >
                  <Sparkles className="h-5 w-5" />
                  What Should I Eat?
                </Button>
                <Link href="/deals" className="w-full">
                  <Button variant="outline" className="w-full h-12 border-border hover:bg-muted">
                    View All Deals
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Featured Image */}
            <div className="relative hidden md:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/food-images/paneer-pizza.jpg"
                  alt="Featured food"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mood Selector */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">What's Your Mood?</h2>
            <p className="mt-2 text-muted-foreground">Let us find the perfect meal for you</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {foodMoods.map((mood) => (
              <MoodButton
                key={mood.id}
                label={mood.label}
                emoji={mood.emoji}
                isSelected={selectedMood === mood.id}
                onClick={() => handleMoodClick(mood.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Restaurants */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Trending Restaurants</h2>
              <p className="mt-2 text-muted-foreground">Most popular right now</p>
            </div>
            <Link href="/restaurants" className="inline-block">
              <Button variant="ghost" className="text-primary gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Popular Dishes</h2>
            <p className="mt-2 text-muted-foreground">Most ordered items this week</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDishes.map((dish: any) => (
              <FoodCard
                key={dish.id}
                item={dish}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Leftover Deals Banner */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent via-primary to-orange-400 p-8 sm:p-12 shadow-xl">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                🎉 Leftover Deals
              </h2>
              <p className="mt-2 text-primary-foreground/80">
                Limited time offers from restaurants with surplus food
              </p>
              <Link href="/deals" className="mt-6 inline-block">
                <Button className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary gap-2">
                  Explore Deals <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-8 sm:py-12 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Ready to Order?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Start with trending restaurants, explore budget options, or invite friends for a group order.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/restaurants">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                Browse Restaurants
              </Button>
            </Link>
            <Link href="/budget-mode">
              <Button variant="outline" className="w-full sm:w-auto">
                Budget Mode
              </Button>
            </Link>
            <Link href="/group-order">
              <Button variant="outline" className="w-full sm:w-auto">
                Group Order
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
