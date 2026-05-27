'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Favorite } from '@/lib/types';
import { wishlistService } from '@/lib/api-services';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: Favorite[];
  loading: boolean;
  isRestaurantFavorite: (restaurantId: string) => boolean;
  isMenuItemFavorite: (menuItemId: string) => boolean;
  toggleRestaurantFavorite: (restaurantId: string) => Promise<void>;
  toggleMenuItemFavorite: (menuItemId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshFavorites = async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const response = await wishlistService.getWishlist();
      if (response.success && response.data) {
        setFavorites(response.data);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [isAuthenticated]);

  const isRestaurantFavorite = (restaurantId: string) => {
    return favorites.some((f) => f.restaurantId === restaurantId);
  };

  const isMenuItemFavorite = (menuItemId: string) => {
    return favorites.some((f) => f.menuItemId === menuItemId);
  };

  const toggleRestaurantFavorite = async (restaurantId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to save favorites');
      return;
    }

    const existing = favorites.find((f) => f.restaurantId === restaurantId);
    try {
      if (existing) {
        // Optimistic UI update
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        const res = await wishlistService.removeFromWishlist(existing.id);
        if (!res.success) {
          // Revert if error
          refreshFavorites();
        }
      } else {
        const res = await wishlistService.addToWishlist({ restaurantId });
        if (res.success && res.data) {
          setFavorites((prev) => [res.data, ...prev]);
        } else {
          refreshFavorites();
        }
      }
    } catch (error) {
      console.error('Failed to toggle restaurant favorite:', error);
      refreshFavorites();
    }
  };

  const toggleMenuItemFavorite = async (menuItemId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to save favorites');
      return;
    }

    const existing = favorites.find((f) => f.menuItemId === menuItemId);
    try {
      if (existing) {
        // Optimistic UI update
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        const res = await wishlistService.removeFromWishlist(existing.id);
        if (!res.success) {
          // Revert if error
          refreshFavorites();
        }
      } else {
        const res = await wishlistService.addToWishlist({ menuItemId });
        if (res.success && res.data) {
          setFavorites((prev) => [res.data, ...prev]);
        } else {
          refreshFavorites();
        }
      }
    } catch (error) {
      console.error('Failed to toggle menu item favorite:', error);
      refreshFavorites();
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        isRestaurantFavorite,
        isMenuItemFavorite,
        toggleRestaurantFavorite,
        toggleMenuItemFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
