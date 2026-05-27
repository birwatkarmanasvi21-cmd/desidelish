'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '@/lib/types';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Clean up any bad data (NaNs) from previous sessions
          const cleaned = parsed.map(item => ({
            ...item,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0
          }));
          setItems(cleaned);
        }
      } catch (e) {
        console.error('Failed to parse cart from localstorage', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    // Ensure quantity is a valid number, default to 1
    const itemToAdd = {
      ...item,
      quantity: Number(item.quantity) || 1
    };

    setItems(prev => {
      const existing = prev.find(i => i.id === itemToAdd.id);
      if (existing) {
        return prev.map(i =>
          i.id === itemToAdd.id 
            ? { ...i, quantity: (Number(i.quantity) || 0) + itemToAdd.quantity } 
            : i
        );
      }
      return [...prev, itemToAdd];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    const newQty = Number(quantity);
    if (isNaN(newQty) || newQty <= 0) {
      removeItem(id);
    } else {
      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity: newQty } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  };

  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotalItems }}>
          {children}
        </CartContext.Provider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
