'use client';

import { useState } from 'react';
import { BillGenerator } from '@/components/bill-generator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantName: string;
  image?: string;
}

import { useCart } from '@/app/providers';

export default function BillPage() {
  const { items, clearCart } = useCart();

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      clearCart();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-primary">Order Bill</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} in order
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Bill Generator */}
          <div className="flex-1">
            <BillGenerator
              items={items}
              restaurantName="Multi-Restaurant Order"
              onClearCart={handleClearCart}
            />
          </div>

          {/* Info Panel */}
          <div className="lg:w-64">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h3 className="font-semibold text-foreground mb-4">Bill Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Total Items</p>
                  <p className="text-lg font-bold text-primary">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Unique Restaurants</p>
                  <p className="text-lg font-bold text-primary">
                    {new Set(items.map(item => item.restaurantName)).size}
                  </p>
                </div>

                <div className="h-px bg-border my-4"></div>

                <div>
                  <p className="text-muted-foreground mb-1">Order Value</p>
                  <p className="text-lg font-bold text-primary">
                    ₹{items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">With Taxes & Fees</p>
                  <p className="text-lg font-bold text-accent">
                    ₹{(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.05 + (items.length > 0 ? 40 : 0)).toFixed(2)}
                  </p>
                </div>
              </div>

              <Link href="/cart" className="w-full mt-6">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Back to Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
