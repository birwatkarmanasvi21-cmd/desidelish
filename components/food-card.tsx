'use client';

import { Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/lib/types';
import { useCart } from '@/app/providers';
import { useFavorites } from '@/app/contexts/FavoritesContext';

interface FoodCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  restaurantName?: string;
}

export function FoodCard({ item, onAddToCart, restaurantName }: FoodCardProps) {
  const { addItem } = useCart();
  const { isMenuItemFavorite, toggleMenuItemFavorite } = useFavorites();
  const isFav = isMenuItemFavorite(item.id);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(item);
    }
    
    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
      restaurantId: (item as any).restaurantId || 'unknown',
      restaurantName: restaurantName || 'Restaurant',
      image: item.image,
    });
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/50">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Favorite Button */}
        <button
          type="button"
          onClick={() => toggleMenuItemFavorite(item.id)}
          className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground backdrop-blur-sm transition-all hover:bg-white hover:scale-110 shadow-md"
          aria-label="Toggle Favorite"
        >
          <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
        </button>

        {/* Rating */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-md">
          <Star className="h-3 w-3 fill-current" />
          {item.rating}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-foreground line-clamp-1">{item.name}</h4>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>

        {/* Price and Button */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{item.price}</span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

