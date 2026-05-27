'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import LoginPage from './login/page';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Note: Automatic dashboard redirection disabled per user request

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, show the login page content
  return <LoginPage />;
}
