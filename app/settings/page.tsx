'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { addressService, authService } from '@/lib/api-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Moon, 
  LogOut, 
  Save,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  // Address State
  const [addressData, setAddressData] = useState({
    id: '',
    address: '',
    city: ''
  });
  
  // Preferences State
  const [notifications, setNotifications] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
      
      const fetchAddress = async () => {
        try {
          const result = await addressService.getAddresses();
          if (result.success && result.data && result.data.length > 0) {
            const defaultAddr = result.data.find((a: any) => a.isDefault) || result.data[0];
            setAddressData({
              id: defaultAddr.id,
              address: defaultAddr.address,
              city: defaultAddr.city
            });
          }
        } catch (err) {
          console.error("Failed to fetch address:", err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAddress();
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await authService.updateProfile(profileData);
      setMessage('Profile updated successfully!');
      // Note: Ideally AuthContext would refresh, but we keep it simple as requested
    } catch (err) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (addressData.id) {
        await addressService.updateAddress(addressData.id, {
          address: addressData.address,
          city: addressData.city
        });
      } else {
        await addressService.addAddress({
          address: addressData.address,
          city: addressData.city,
          isDefault: true
        });
      }
      setMessage('Address updated successfully!');
    } catch (err) {
      setMessage('Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/10 pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {message && (
          <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            {message}
          </div>
        )}

        {/* Profile Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <UserIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
          </div>
          <Card className="p-6 shadow-md border-border">
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <Input 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    placeholder="Enter your first name"
                    className="bg-muted focus:bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <Input 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    placeholder="Enter your last name"
                    className="bg-muted focus:bg-background"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email Address (Primary)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={user?.email || ''} 
                    disabled 
                    className="pl-10 bg-secondary/20 cursor-not-allowed opacity-70"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground px-1">Email cannot be changed for security reasons.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="Enter your mobile number"
                    className="pl-10 bg-muted focus:bg-background"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button disabled={saving} className="w-full sm:w-auto gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </section>

        {/* Address Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Delivery Address</h2>
          </div>
          <Card className="p-6 shadow-md border-border">
            <form onSubmit={handleAddressSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Street Address</label>
                <Input 
                  value={addressData.address}
                  onChange={(e) => setAddressData({...addressData, address: e.target.value})}
                  placeholder="H.No, Street, Locality"
                  className="bg-muted focus:bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">City / Town</label>
                <Input 
                  value={addressData.city}
                  onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                  placeholder="Enter city"
                  className="bg-muted focus:bg-background"
                />
              </div>
              <div className="pt-2">
                <Button variant="outline" disabled={saving} className="w-full sm:w-auto gap-2 border-border">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Update Address
                </Button>
              </div>
            </form>
          </Card>
        </section>

        {/* Preferences Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">App Preferences</h2>
          </div>
          <Card className="p-6 shadow-md border-border divide-y divide-border">
            <div className="flex items-center justify-between py-4 first:pt-0">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Get updates on your order status</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-4 last:pb-0 font-sans">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <Moon className="h-4 w-4 text-foreground" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle application theme</p>
                </div>
              </div>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </Card>
        </section>

        {/* Logout Section */}
        <section className="pt-8 border-t border-border">
          <Button 
            variant="destructive" 
            className="w-full h-12 gap-2 text-lg font-bold"
            onClick={() => {
              if (confirm('Are you sure you want to log out?')) {
                logout();
              }
            }}
          >
            <LogOut className="h-5 w-5" />
            Logout from DesiDelish
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Version 1.0.4 • Made with ❤️ by DesiDelish Team
          </p>
        </section>
      </div>
    </div>
  );
}
