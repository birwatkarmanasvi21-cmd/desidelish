'use client';

import Link from 'next/link';
import { Star, Clock, MapPin, Heart } from 'lucide-react';
import { Restaurant } from '@/lib/types';
import { useFavorites } from '@/app/contexts/FavoritesContext';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { isRestaurantFavorite, toggleRestaurantFavorite } = useFavorites();
  const isFav = isRestaurantFavorite(restaurant.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleRestaurantFavorite(restaurant.id);
  };

  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <div className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/50">
        {/* Image */}
        <div className="relative h-40 overflow-hidden bg-muted">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Favorite Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground backdrop-blur-sm transition-all hover:bg-white hover:scale-110 shadow-md"
            aria-label="Toggle Favorite"
          >
            <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
          </button>

          {/* Rating Badge */}
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground shadow-md">
            <Star className="h-4 w-4 fill-current" />
            <span>{restaurant.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1">{restaurant.name}</h3>
          
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
            {restaurant.cuisine.join(', ')}
          </p>

          {/* Footer Info */}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{restaurant.distance} km</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <span>{'₹'.repeat(restaurant.priceRange)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

