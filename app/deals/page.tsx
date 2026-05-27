'use client';

import { useState, useEffect } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DealBadge } from '@/components/deal-badge';
import { getDeals } from '@/lib/api';
import { Deal } from '@/lib/types';
import { useCart } from '@/app/providers';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const data = await getDeals();
        setDeals(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch deals');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);
  
  const handleAddToCart = (deal: Deal) => {
    addItem({
      id: deal.id,
      name: deal.itemName,
      price: deal.discountedPrice,
      quantity: 1,
      restaurantId: deal.restaurantId,
      restaurantName: deal.restaurant,
      image: deal.image,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-r from-accent via-primary to-orange-400 py-8 sm:py-12 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="h-8 w-8" />
            <h1 className="text-3xl sm:text-4xl font-bold">Leftover Deals</h1>
          </div>
          <p className="text-primary-foreground/80 max-w-2xl">
            Limited time offers from restaurants with surplus food. Great savings on your favorite dishes!
          </p>
        </div>
      </section>

      {/* Deals Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Deals Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium">Hunting for the freshest deals...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-12 text-center my-8">
            <p className="text-destructive font-medium mb-2">Error loading deals</p>
            <p className="text-sm text-destructive/70">{error}</p>
          </div>
        ) : deals && deals.length > 0 ? (
          <>
            {/* Stats */}
            <div className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-primary">{deals.length}</div>
                <p className="mt-2 text-sm text-muted-foreground">Active Deals</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-accent">
                  {Math.round(deals.reduce((sum, d) => sum + (d.discount || 0), 0) / deals.length)}%
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Avg. Discount</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-primary">
                  ₹{(deals.reduce((sum, d) => sum + (Number(d.originalPrice) - Number(d.discountedPrice)), 0)).toFixed(2)}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Total Savings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {deals.map((deal) => (
                <DealBadge
                  key={deal.id}
                  deal={deal}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center my-8">
            <p className="text-muted-foreground">No active deals right now. Check back soon!</p>
          </div>
        )}

        {/* Additional Deals Section */}
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
            Why Choose Leftover Deals?
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Save up to 50% on restaurant quality food</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Fresh food from verified restaurants</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Limited quantities - grab them fast!</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Help restaurants reduce food waste</span>
            </li>
          </ul>
        </div>
      </div>

      {/* How It Works */}
      <section className="border-t border-border bg-card py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
            How Leftover Deals Work
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Browse</h3>
              <p className="text-sm text-muted-foreground">
                Check out deals from nearby restaurants with surplus inventory
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Select</h3>
              <p className="text-sm text-muted-foreground">
                Pick your favorite discounted items before they run out
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Save</h3>
              <p className="text-sm text-muted-foreground">
                Enjoy great food at amazing prices, guilt-free
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
