'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MapPin, Mail, Phone, ArrowRight, Lock, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { addressService } from '@/lib/api-services';
import { reverseGeocode } from '@/lib/location-utils';

export default function AuthPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    latitude: 0,
    longitude: 0,
    address: '',
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a 10-digit phone number');
      return false;
    }
    return true;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleGetLocation = async () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const result = await reverseGeocode(latitude, longitude);

          if (result.success) {
            setFormData((prev) => ({
              ...prev,
              latitude,
              longitude,
              address: result.address,
              city: result.city,
            }));
          } else {
            setError(result.error || 'Failed to fetch address information');
          }

          setLoading(false);
        } catch {
          setError('Failed to fetch address information');
          setLoading(false);
        }
      },
      (geoError) => {
        setError(`Failed to get location: ${geoError.message}`);
        setLoading(false);
      }
    );
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // 1. Signup through AuthContext
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      // 2. Add address if location was picked
      if (formData.address) {
        try {
          await addressService.addAddress({
            address: formData.address,
            city: formData.city,
            latitude: formData.latitude,
            longitude: formData.longitude,
            isDefault: true,
          });
        } catch (addrErr) {
          console.error("Address save failed:", addrErr);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-100 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden rounded-3xl backdrop-blur-sm bg-white/80">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 overflow-hidden rounded-2xl shadow-xl bg-orange-100 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="DesiDelish Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<span class="text-4xl">🍽️</span>';
                  }}
                />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-orange-600 tracking-tight mb-2">DesiDelish</h1>
            <p className="text-muted-foreground font-medium">Join the next generation of food delivery</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-orange-500 text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>
              {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <div className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-100'}`} />
            <div className={`flex items-center justify-center h-8 w-8 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-orange-500 text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>
              2
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Name Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">First Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10 h-14 bg-gray-50/50 border-gray-100 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Last Name</label>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="h-14 bg-gray-50/50 border-gray-100 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12 h-14 bg-gray-50/50 border-gray-100 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-12 h-14 bg-gray-50/50 border-gray-100 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Choose Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-12 h-14 bg-gray-50/50 border-gray-100 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-gray-700">Delivery Address</label>
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleGetLocation}
                    disabled={loading}
                    className="text-orange-600 font-bold p-0 h-auto hover:no-underline"
                  >
                    <MapPin className="mr-1 h-4 w-4" />
                    Detect Location
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    readOnly
                    placeholder="Street Address"
                    className="h-12 bg-gray-50/20 border-gray-100 rounded-lg text-sm"
                  />
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    readOnly
                    placeholder="City"
                    className="h-12 bg-gray-50/20 border-gray-100 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-14 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-[2] h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                      Creating...
                    </span>
                  ) : 'Finish & Order'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-10 text-center text-sm text-gray-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-600 hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
