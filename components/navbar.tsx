'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, LogIn, LogOut, LayoutDashboard, Settings, User as UserIcon, ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/app/contexts/AuthContext';
import { useCart } from '@/app/providers';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated, logout, user, loading: authLoading } = useAuth();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();

  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/auth' || pathname === '/signup';
  
  // Requirement: Logo should go to dashboard if authenticated, else root (login/signup)
  // But if we are on an auth page, always go to root to "remove dashboard opt" context
  const homeLink = (isAuthenticated && !isAuthPage) ? "/dashboard" : "/";

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={homeLink} className="flex items-center gap-2">
            <div className="h-10 w-10 overflow-hidden rounded-lg flex items-center justify-center bg-orange-100">
              <img 
                src="/logo.png" 
                alt="DesiDelish Logo" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<span class="text-sm font-bold text-orange-600">DD</span>';
                }}
              />
            </div>
            <span className="hidden font-bold text-foreground sm:inline">DesiDelish</span>
          </Link>

          {/* Center - Search on desktop */}
          {!isAuthPage && (
            <div className="hidden flex-1 mx-8 md:flex">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search restaurants or food..."
                  className="w-full rounded-lg border border-border bg-muted pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Search */}
            {!isAuthPage && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Auth Buttons / Settings Dropdown */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                {!isAuthPage && (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="hidden md:inline">Dashboard</span>
                      </Button>
                    </Link>
                    <Link href="/orders">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        <span className="hidden md:inline">My Orders</span>
                      </Button>
                    </Link>
                    <Link href="/favorites">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Heart className="h-4 w-4" />
                        <span className="hidden md:inline">Favorites</span>
                      </Button>
                    </Link>
                  </>
                )}

                {/* Settings Dropdown Column */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Link href="/settings">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Button>
                    </Link>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex w-full items-center">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="flex w-full items-center">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>My Orders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites" className="flex w-full items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Favorites</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex w-full items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Account Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer" 
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : !isAuthPage ? (
              <Link href="/login" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            ) : null}

            {/* Cart */}
            {(!isAuthPage || isAuthenticated) && (
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="mt-8 flex flex-col gap-4">
                  <Link href={homeLink} className="font-semibold text-foreground">
                    {isAuthenticated && !isAuthPage ? "Dashboard" : "Home"}
                  </Link>
                  {isAuthenticated && !isAuthPage && (
                    <>
                      <Link href="/orders" className="text-foreground">My Orders</Link>
                      <Link href="/favorites" className="text-foreground">Favorites</Link>
                    </>
                  )}
                  <Link href="/restaurants" className="text-foreground">Restaurants</Link>
                  <Link href="/budget-mode" className="text-foreground">Budget Mode</Link>
                  <Link href="/group-order" className="text-foreground">Group Order</Link>
                  <Link href="/deals" className="text-foreground">Deals</Link>
                  <div className="mt-4 pt-4 border-t border-border">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Settings</p>
                        <Link href="/settings" className="w-full">
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <UserIcon className="h-4 w-4" />
                            Profile & Settings
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start gap-2 text-destructive" onClick={logout}>
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    ) : !isAuthPage ? (
                      <Link href="/login" className="block">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <LogIn className="h-4 w-4" />
                          Login
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {!isAuthPage && searchOpen && (
          <div className="pb-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-lg border border-border bg-muted pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
