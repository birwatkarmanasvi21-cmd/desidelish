import { Clock, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Deal } from '@/lib/types';

interface DealBadgeProps {
  deal: Deal;
  onAddToCart: (deal: Deal) => void;
}

export function DealBadge({ deal, onAddToCart }: DealBadgeProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-accent/50 bg-card transition-all hover:shadow-lg hover:border-accent">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={deal.image}
          alt={deal.itemName}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Discount Badge */}
        <div className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 font-bold text-accent-foreground shadow-lg">
          -{deal.discount}%
        </div>

        {/* Timer Badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-1 text-xs font-semibold text-white shadow-md">
          <Clock className="h-3 w-3" />
          {deal.timeLeft}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-foreground line-clamp-1">{deal.itemName}</h4>
        <p className="text-xs text-muted-foreground">{deal.restaurant}</p>

        {/* Prices */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm line-through text-muted-foreground">
            ₹{deal.originalPrice}
          </span>
          <span className="text-xl font-bold text-accent">
            ₹{deal.discountedPrice}
          </span>
        </div>

        {/* Stock and Button */}
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingDown className="h-3 w-3" />
            Only {deal.quantity} left
          </span>
          <Button
            size="sm"
            onClick={() => onAddToCart(deal)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Grab
          </Button>
        </div>
      </div>
    </div>
  );
}
