'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { addressService, orderService } from '@/lib/api-services';
import { Address } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { MapPin, CreditCard, ShoppingBag, Plus, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'COD'>('CARD');
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load Addresses
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await addressService.getAddresses();
      if (res.success && res.data) {
        setAddresses(res.data);
        const defaultAddr = res.data.find((a: Address) => a.isDefault) || res.data[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      alert('Please fill out all address fields');
      return;
    }

    try {
      const res = await addressService.addAddress({
        addressLine1: newAddress.addressLine1,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        latitude: 12.9716, // Default Bangalore coordinates
        longitude: 77.5946,
        addressType: 'HOME',
        isDefault: addresses.length === 0,
      });

      if (res.success && res.data) {
        setAddresses((prev) => [res.data, ...prev]);
        setSelectedAddressId(res.data.id);
        setIsAddingAddress(false);
        setNewAddress({ addressLine1: '', city: '', state: '', postalCode: '' });
      } else {
        alert(res.error || 'Failed to add address');
      }
    } catch (error) {
      console.error('Failed to add address:', error);
      alert('An error occurred while saving address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address');
      return;
    }

    setLoading(true);
    try {
      // 1. Sync local cart items to the database first
      const syncItems = items.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      }));

      const syncRes = await orderService.syncCart(syncItems);
      if (!syncRes.success) {
        throw new Error(syncRes.error || 'Failed to sync cart items with server');
      }

      // 2. Checkout order
      const checkoutRes = await orderService.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
      });

      if (checkoutRes.success && checkoutRes.data) {
        setOrderNumber(checkoutRes.data.orderNumber);
        setSuccess(true);
        clearCart();
        
        // Redirect to tracking page after 3 seconds
        setTimeout(() => {
          router.push('/orders');
        }, 3000);
      } else {
        alert(checkoutRes.error || 'Failed to checkout');
      }
    } catch (error: any) {
      console.error('Order placement failed:', error);
      alert(error.message || 'An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.05; // 5% GST
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const total = subtotal + gst + deliveryFee;

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center bg-card border border-border p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse" />
          
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/30 text-primary">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-4">Your delicious feast is on the way.</p>
          
          <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Order Identifier</p>
            <p className="text-lg font-mono font-bold text-primary">{orderNumber || 'DEL-10928-DD'}</p>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            A mobile-responsive digital invoice is being processed to your inbox. Redirecting you to the live tracker...
          </p>

          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Secure Checkout</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-md">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your checkout cart is empty</h2>
            <p className="text-muted-foreground mb-6">Please add some tasty items from the menu first!</p>
            <Link href="/restaurants">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Restaurants</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Options Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Address Box */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Delivery Address
                  </h2>
                  {!isAddingAddress && (
                    <Button variant="ghost" size="sm" onClick={() => setIsAddingAddress(true)} className="text-primary hover:text-primary/80 gap-1">
                      <Plus className="h-4 w-4" /> Add New
                    </Button>
                  )}
                </div>

                {isAddingAddress ? (
                  <form onSubmit={handleAddAddress} className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                    <h3 className="font-semibold text-sm text-foreground">Add New Address</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          value={newAddress.addressLine1}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                          placeholder="e.g. 123 Main St, Apartment 4B"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            placeholder="e.g. Tech City"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">State</label>
                          <input
                            type="text"
                            required
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            placeholder="e.g. Karnataka"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">Postal Code</label>
                          <input
                            type="text"
                            required
                            value={newAddress.postalCode}
                            onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                            placeholder="e.g. 560001"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingAddress(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Save & Select
                      </Button>
                    </div>
                  </form>
                ) : addressesLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8 bg-muted/10 border border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted-foreground mb-4">No saved delivery addresses found.</p>
                    <Button size="sm" onClick={() => setIsAddingAddress(true)} className="bg-primary text-primary-foreground">
                      Add Your First Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all flex items-start gap-3 ${
                          selectedAddressId === addr.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border bg-card hover:bg-muted/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="addressRadio"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-primary focus:ring-primary accent-primary"
                        />
                        <div className="text-sm">
                          <p className="font-bold text-foreground capitalize">
                            {addr.addressType || 'Delivery Address'} {addr.isDefault && <span className="ml-1 text-[10px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded-full">Default</span>}
                          </p>
                          <p className="mt-1 text-muted-foreground leading-relaxed">
                            {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}
                            <br />
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Box */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4 border-b border-border pb-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </h2>

                <div className="grid grid-cols-3 gap-4">
                  {(['CARD', 'UPI', 'COD'] as const).map((method) => (
                    <div
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`cursor-pointer rounded-xl border p-4 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        paymentMethod === method
                          ? 'border-primary bg-primary/5 shadow-sm font-semibold text-primary'
                          : 'border-border bg-card hover:bg-muted/30 text-foreground'
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${paymentMethod === method ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {method === 'CARD' && <span className="text-xs font-bold">💳</span>}
                        {method === 'UPI' && <span className="text-xs font-bold">📲</span>}
                        {method === 'COD' && <span className="text-xs font-bold">💵</span>}
                      </div>
                      <span className="text-sm">
                        {method === 'CARD' && 'Credit/Debit Card'}
                        {method === 'UPI' && 'UPI / NetBanking'}
                        {method === 'COD' && 'Cash on Delivery'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-lg space-y-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Summary Review
                </h2>

                {/* Items List */}
                <div className="max-h-48 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <span className="font-bold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakout */}
                <div className="space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST (2.5%)</span>
                    <span className="text-foreground font-medium">₹{gst.toFixed(2) === '0.00' ? '₹0.00' : `₹${(subtotal * 0.025).toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST (2.5%)</span>
                    <span className="text-foreground font-medium">₹{gst.toFixed(2) === '0.00' ? '₹0.00' : `₹${(subtotal * 0.025).toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span className="text-foreground font-medium">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold text-foreground border-t border-border pt-4">
                    <span>Grand Total</span>
                    <span className="text-xl text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddressId}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-sm font-bold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order • ₹${total.toFixed(2)}`
                  )}
                </Button>
                
                {!selectedAddressId && (
                  <p className="text-xs text-rose-500 font-semibold text-center mt-2">
                    ⚠️ Delivery Address required to place order.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
