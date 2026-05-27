'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Loader2, MapPin, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FoodCard } from '@/components/food-card';
import { getRestaurantById } from '@/lib/api';
import { useCart } from '@/app/providers';

type MenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: string | number;
  imageUrl: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MenuCategory = {
  id: string;
  restaurantId: string;
  name: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  menuItems: MenuItem[];
};

type Restaurant = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerImageUrl: string;
  rating: string | number;
  reviewCount: number;
  latitude: string | number;
  longitude: string | number;
  address: string;
  city: string;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  isOpen: boolean;
  createdAt?: string;
  updatedAt?: string;
  categories: MenuCategory[];
  image?: string;
  cuisine?: string[] | string;
  distance?: number;
  deliveryTime?: string;
  priceRange?: number;
  minOrder?: number;
};

export default function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const cartContext = useCart?.();
  const addItem = cartContext?.addItem;

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurantById(id);
        setRestaurant(data);
      } catch (err: any) {
        setError(err?.message || 'Restaurant not found');
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  const categoryNames = useMemo(() => {
    if (!restaurant?.categories) return ['All'];
    return ['All', ...restaurant.categories.map((category) => category.name)];
  }, [restaurant]);

  const filteredItems = useMemo(() => {
    if (!restaurant?.categories) return [];

    const categories =
      selectedCategory === 'All'
        ? restaurant.categories
        : restaurant.categories.filter(
          (category) => category.name === selectedCategory
        );

    return categories.flatMap((category) =>
      (category.menuItems || []).map((item) => ({
        ...item,
        categoryName: category.name,
      }))
    );
  }, [restaurant, selectedCategory]);

  const handleAddToCart = (item: MenuItem & { categoryName?: string }) => {
    if (!addItem || !restaurant) return;

    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
      image: item.imageUrl,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      description: item.description,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading restaurant...</span>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/restaurants">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Restaurants
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center space-y-4">
            <div className="rounded-2xl bg-red-50 px-8 py-6 text-red-600">
              <h2 className="text-3xl font-bold mb-2">Oops!</h2>
              <p>{error || 'Restaurant not found'}</p>
            </div>
            <Link href="/restaurants">
              <Button variant="outline">Back to Restaurants</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bannerImage =
    restaurant.bannerImageUrl || restaurant.logoUrl || '/placeholder-restaurant.jpg';

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/restaurants">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Restaurants
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative h-64 w-full overflow-hidden md:h-80">
        <img
          src={bannerImage}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 py-6 text-white">
          <div className="flex items-end gap-4">
            <img
              src={restaurant.logoUrl || bannerImage}
              alt={`${restaurant.name} logo`}
              className="h-20 w-20 rounded-2xl border-2 border-white object-cover bg-white"
            />
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">{restaurant.name}</h1>
              <p className="mt-1 max-w-2xl text-sm text-white/90 md:text-base">
                {restaurant.description}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{Number(restaurant.rating).toFixed(1)}</span>
                  <span>({restaurant.reviewCount} reviews)</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} mins
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {restaurant.address}, {restaurant.city}
                  </span>
                </div>

                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${restaurant.isOpen
                      ? 'bg-green-500/90 text-white'
                      : 'bg-red-500/90 text-white'
                    }`}
                >
                  {restaurant.isOpen ? 'Open' : 'Closed'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          {categoryNames.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
            No menu items found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <FoodCard
                key={item.id}
                item={{
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  price: Number(item.price),
                  image: item.imageUrl || '/placeholder-food.jpg',
                  rating: Number(restaurant.rating),
                }}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}