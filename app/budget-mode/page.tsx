'use client';

import { useState } from 'react';
import { Wallet, Users, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { budgetService } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';

interface MealCombination {
  id: string;
  items: {
    name: string;
    price: number;
    restaurant: string;
  }[];
  total: number;
  items_count: number;
}

import { useCart } from '@/app/providers';

export default function BudgetModePage() {
  const { addItem } = useCart();
  const [budget, setBudget] = useState<number>(200);
  const [showResults, setShowResults] = useState(false);

  const { data: mealCombinations, loading, error } = useApi<any[]>(
    () => budgetService.getBudgetSuggestions(budget),
    [showResults, budget], // Re-fetch when results are requested or budget changes
    { skip: !showResults } // Don't fetch until the user clicks the button
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <section className="border-b border-border bg-card py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Budget Mode</h1>
          </div>
          <p className="text-muted-foreground">Find delicious meal combinations within your budget</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Budget Input Section */}
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-6">
            What's Your Budget?
          </h2>

          <div className="space-y-6">
            {/* Slider */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-foreground">Budget Amount</label>
                <div className="text-3xl font-bold text-primary">₹{budget}</div>
              </div>
              <input
                type="range"
                min="60"
                max="1000"
                step="10"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>₹60</span>
                <span>₹1000</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Quick Presets</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[100, 250, 500, 750].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setBudget(preset)}
                    className={`rounded-lg border-2 py-2 font-medium transition-all ${budget === preset
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted text-foreground hover:border-primary/50'
                      }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Find Combinations Button */}
            <Button
              size="lg"
              disabled={loading}
              onClick={() => setShowResults(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Calculating Best Value...
                </>
              ) : 'Find Meal Combinations'}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {showResults && error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center mb-8">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowResults(false)}>
              Try Again
            </Button>
          </div>
        )}

        {/* Results */}
        {showResults && !loading && !error && mealCombinations && mealCombinations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">
                {mealCombinations.length} Combinations Found
              </h2>
            </div>

            <div className="grid gap-6">
              {mealCombinations.map((combo, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {combo.items.length} items
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {combo.items.map((item: any, itemIdx: number) => (
                          <div key={itemIdx} className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.restaurantName || item.restaurant}</p>
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              ₹{item.price}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total (Incl. tax)</span>
                          <span className="text-2xl font-bold text-primary">
                            ₹{combo.totalPrice || combo.total}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        combo.items.forEach((item: any) => {
                          addItem({
                            id: item.id || `combo-${idx}-${Math.random()}`, // Ensure unique ID
                            name: item.name,
                            price: Number(item.price),
                            quantity: 1,
                            restaurantId: combo.restaurantId || 'unknown',
                            restaurantName: item.restaurantName || item.restaurant || 'Restaurant',
                            image: item.image || '/placeholder-food.jpg',
                          });
                        });
                        window.location.href = '/cart';
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Add Combination to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {mealCombinations && mealCombinations.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">
                  No meal combinations found for ₹{budget}. Try increasing your budget.
                </p>
              </div>
            )}
          </div>
        )}

        {showResults && !loading && !error && (!mealCombinations || mealCombinations.length === 0) && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-6">
              No meal combinations found for ₹{budget}. Try increasing your budget.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowResults(false)}
            >
              Adjust Budget
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
