'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { orderService } from '@/lib/api-services';
import { Order } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, Clock, CheckCircle2, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/orders');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await orderService.getUserOrders();
      if (res.success && res.data) {
        setOrders(res.data);
        
        // Auto-expand the first active order if there is one
        const activeOrder = res.data.find(
          (o: Order) => ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status)
        );
        if (activeOrder && !expandedOrderId) {
          setExpandedOrderId(activeOrder.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(true);
    }
  }, [isAuthenticated]);

  // Polling logic: if there is an active order in the list, refetch every 5 seconds to show simulation steps
  useEffect(() => {
    if (!isAuthenticated) return;

    const hasActiveOrder = orders.some((o) =>
      ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status)
    );

    if (!hasActiveOrder) return;

    const interval = setInterval(() => {
      fetchOrders(false); // background fetch without loader
    }, 5000);

    return () => clearInterval(interval);
  }, [orders, isAuthenticated]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Helper to render visual steps for an order status
  const renderStatusTracker = (status: Order['status']) => {
    if (status === 'CANCELLED') {
      return (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 p-4 text-center mt-4">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Order Cancelled</p>
          <p className="text-xs text-muted-foreground mt-1">This order was cancelled. Please check menu for other tasty deals.</p>
        </div>
      );
    }

    const steps = [
      { key: 'PLACED', label: 'Placed', icon: '📝' },
      { key: 'PREPARING', label: 'Preparing', icon: '🍳' },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵' },
      { key: 'DELIVERED', label: 'Delivered', icon: '🎁' },
    ];

    const getStatusIndex = (current: string) => {
      if (current === 'PLACED') return 0;
      if (current === 'PREPARING') return 1;
      if (current === 'OUT_FOR_DELIVERY') return 2;
      if (current === 'DELIVERED') return 3;
      return -1;
    };

    const activeIndex = getStatusIndex(status);

    return (
      <div className="mt-6 border-t border-border pt-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Delivery Status Tracker</p>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Connector Line on Desktop */}
          <div className="absolute top-[15px] left-8 right-8 hidden md:block h-1 bg-muted -z-10 rounded">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-1000 rounded"
              style={{ width: `${(activeIndex / 3) * 100}%` }}
            />
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            const isPending = idx > activeIndex;

            return (
              <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 w-full">
                {/* Circle step badge */}
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 border ${
                    isCompleted
                      ? 'bg-orange-500 border-orange-500 text-white font-bold'
                      : isActive
                      ? 'bg-amber-100 dark:bg-amber-950/30 border-orange-500 text-primary animate-pulse font-extrabold ring-4 ring-orange-500/20'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>

                {/* Text labels */}
                <div className="text-left md:text-center">
                  <p
                    className={`text-sm font-bold transition-all duration-300 ${
                      isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 mt-0.5">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" /> In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">My Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor active deliveries and view complete billing history.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchOrders(true)} className="gap-2">
            Refresh List
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-md">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders placed yet</h2>
            <p className="text-muted-foreground mb-6">Explore regional restaurants and place your first order!</p>
            <Link href="/restaurants">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Order Now</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const isActive = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(order.status);

              return (
                <div
                  key={order.id}
                  className={`rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 ${
                    isActive ? 'border-primary/40 ring-1 ring-primary/10' : ''
                  }`}
                >
                  {/* Card Header clickable row */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="cursor-pointer p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10 hover:bg-muted/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Logo or placeholder */}
                      <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-950/20 text-primary flex items-center justify-center font-bold text-lg">
                        🥞
                      </div>
                      <div>
                        <h3 className="font-extrabold text-foreground text-base">
                          {order.restaurant?.name || 'Pizza Palace'}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold">{formattedDate}</span>
                          <span>•</span>
                          <span className="font-mono text-primary font-bold">{order.orderNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-sm text-slate-400 font-medium">Grand Total</p>
                        <p className="text-base font-extrabold text-primary">₹{Number(order.total).toFixed(2)}</p>
                      </div>

                      {/* Status indicator badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : order.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse'
                        }`}
                      >
                        {order.status === 'DELIVERED' ? '✓ Delivered' : order.status === 'CANCELLED' ? '✕ Cancelled' : order.status.replace(/_/g, ' ')}
                      </span>

                      {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Tracker and items */}
                  {isExpanded && (
                    <div className="p-6 border-t border-border bg-card space-y-6">
                      
                      {/* Active Status Tracker */}
                      {renderStatusTracker(order.status)}

                      {/* Order Details & Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6 mt-6">
                        
                        {/* Left Details */}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Order Invoice Breakdown</p>
                          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm text-foreground">
                                <span className="flex-1 truncate pr-2">
                                  <strong>{item.quantity}</strong> × {item.menuItem?.name || 'Delicious Dish'}
                                </span>
                                <span className="font-semibold text-foreground">₹{Number(item.totalPrice).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t border-border pt-2 mt-2 space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{Number(order.subtotal).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>CGST/SGST (5%)</span>
                                <span>₹{(Number(order.subtotal) * 0.05).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>₹{Number(order.deliveryFee).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm font-extrabold text-primary border-t border-border pt-2 mt-2">
                                <span>Paid via {order.paymentMethod}</span>
                                <span>₹{Number(order.total).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Details */}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Delivery Information</p>
                          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 text-sm">
                            <div className="flex gap-2 items-start text-foreground">
                              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">Destination Address</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {order.address?.addressLine1 || 'Default Delivery Street'}
                                  {order.address?.addressLine2 ? `, ${order.address.addressLine2}` : ''}
                                  <br />
                                  {order.address?.city || 'Tech City'}, {order.address?.state || 'State'} - {order.address?.postalCode || '000000'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center text-foreground border-t border-border pt-3">
                              <Clock className="h-5 w-5 text-primary shrink-0" />
                              <div>
                                <p className="font-bold text-xs">Estimated Arrival</p>
                                <p className="text-xs text-muted-foreground">30-45 minutes</p>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
