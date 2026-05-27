import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl sm:text-8xl font-bold text-primary">404</h1>
          <div className="mt-4 h-1 w-20 bg-gradient-to-r from-primary to-accent rounded-full mx-auto" />
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Looks like you've wandered off the menu. Let's get you back to discovering delicious food.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              Back to Home <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/restaurants">
            <Button variant="outline">
              Browse Restaurants
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
