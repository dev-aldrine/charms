import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Package, 
  ArrowLeft, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { InteractiveAddressMap } from '../components/profile/InteractiveAddressMap';
import { formatPHP } from '../utils/formatters';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=compress&cs=tinysrgb&w=150',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=compress&cs=tinysrgb&w=150',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=compress&cs=tinysrgb&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=compress&cs=tinysrgb&w=150'
];

export const ProfilePage = ({ onBack, onSelectProduct }) => {
  const { user, updateProfile, fetchProfile, loading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
    address: {
      street: user?.address?.street || '',
      barangay: user?.address?.barangay || '',
      city: user?.address?.city || '',
      province: user?.address?.province || 'Metro Manila',
      postalCode: user?.address?.postalCode || '',
      notes: user?.address?.notes || ''
    },
    location: user?.location || { lat: 14.5995, lng: 120.9842 }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showAvatarChooser, setShowAvatarChooser] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        address: {
          street: user.address?.street || '',
          barangay: user.address?.barangay || '',
          city: user.address?.city || '',
          province: user.address?.province || 'Metro Manila',
          postalCode: user.address?.postalCode || '',
          notes: user.address?.notes || ''
        },
        location: user.location || { lat: 14.5995, lng: 120.9842 }
      });
      fetchUserOrders(user.email);
    }
  }, [user]);

  const fetchUserOrders = async (email) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/auth/user-orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLocationChange = (coords) => {
    setFormData(prev => ({
      ...prev,
      location: coords
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 py-10 md:py-16 space-y-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-botanical-stone/80 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-botanical-stone bg-white flex items-center justify-center text-botanical-forest hover:bg-botanical-stone transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-botanical-sage font-bold">
              Customer Sanctuary
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-botanical-forest">
              Your Atelier Profile
            </h1>
          </div>
        </div>

        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-full text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile & Delivery Location Saved</span>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Left Column: Avatar & Account Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-botanical-stone shadow-botanical-sm text-center space-y-5">
            {/* Avatar with edit overlay */}
            <div className="relative w-28 h-28 mx-auto">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-botanical-forest/20 shadow-md bg-botanical-bg flex items-center justify-center">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt={formData.name || 'User Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-botanical-forest text-white flex items-center justify-center font-serif text-3xl font-bold">
                    {formData.name?.[0]?.toUpperCase() || formData.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarChooser(!showAvatarChooser)}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-botanical-forest text-white flex items-center justify-center hover:bg-botanical-terracotta transition-colors shadow-sm"
                title="Change Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar Selector Dropdown / Input */}
            {showAvatarChooser && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-botanical-bg rounded-2xl border border-botanical-stone space-y-3 text-left"
              >
                <label className="text-[10px] uppercase font-bold tracking-wider text-botanical-forest/70 block">
                  Select Preset Avatar:
                </label>
                <div className="flex justify-center gap-2">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, avatarUrl: url });
                        setShowAvatarChooser(false);
                      }}
                      className="w-9 h-9 rounded-full overflow-hidden border border-botanical-stone hover:ring-2 hover:ring-botanical-forest transition-all"
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="pt-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-botanical-forest/70 block mb-1">
                    Or Image URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    onBlur={() => {
                      if (customAvatarInput) {
                        setFormData({ ...formData, avatarUrl: customAvatarInput });
                        setShowAvatarChooser(false);
                      }
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-botanical-stone text-xs"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <h2 className="font-serif text-xl font-bold text-botanical-forest">
                {formData.name || 'Atelier Client'}
              </h2>
              <p className="text-xs text-botanical-forest/60 font-mono mt-0.5">
                {formData.email}
              </p>
            </div>

            <div className="pt-4 border-t border-botanical-stone/60 flex items-center justify-around text-xs text-botanical-forest/70">
              <div>
                <span className="font-bold text-botanical-forest block text-base font-serif">{orders.length}</span>
                <span className="text-[10px] uppercase tracking-wider">Orders</span>
              </div>
              <div className="w-px h-8 bg-botanical-stone" />
              <div>
                <span className="font-bold text-botanical-forest block text-base font-serif">Member</span>
                <span className="text-[10px] uppercase tracking-wider">Atelier Circle</span>
              </div>
            </div>
          </div>

          {/* Quick Order History Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-botanical-stone shadow-botanical-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-botanical-stone/60 pb-3">
              <Package className="w-4 h-4 text-botanical-sage" />
              <h3 className="font-serif text-base font-semibold text-botanical-forest">
                Recent Orders ({orders.length})
              </h3>
            </div>

            {loadingOrders ? (
              <p className="text-xs text-botanical-forest/60 text-center py-4">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-xs text-botanical-forest/60 text-center py-4">
                No orders yet. Handcrafted orders will show up here.
              </p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {orders.map((o) => (
                  <div key={o.orderNumber} className="p-3 bg-botanical-bg rounded-2xl border border-botanical-stone text-xs space-y-1.5">
                    <div className="flex justify-between font-mono font-bold text-botanical-forest">
                      <span>#{o.orderNumber}</span>
                      <span className="text-botanical-terracotta">{formatPHP(o.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-botanical-forest/60">
                      <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                      <span className="capitalize font-semibold text-emerald-700">{o.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sign Out Action */}
          <button
            type="button"
            onClick={() => {
              useAuthStore.getState().logout();
              onBack();
            }}
            className="w-full py-3.5 px-4 rounded-2xl border border-botanical-stone hover:border-red-300 hover:bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wider transition-colors bg-white shadow-xs"
          >
            Sign Out of Account
          </button>
        </div>

        {/* Right 2 Columns: Editable Details & Interactive Leaflet Map */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Contact Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-botanical-stone shadow-botanical-sm space-y-6">
            <h3 className="font-serif text-xl font-semibold text-botanical-forest flex items-center gap-2">
              <User className="w-5 h-5 text-botanical-sage" />
              <span>Personal &amp; Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-botanical-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Maria Santos"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest focus:ring-1 focus:ring-botanical-forest transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Mobile Number (For Delivery Riders)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-botanical-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0917 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest focus:ring-1 focus:ring-botanical-forest transition-all"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Email Address (Official Account)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-botanical-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans bg-botanical-bg/60 text-botanical-forest/70 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address & Interactive Pinpoint Map */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-botanical-stone shadow-botanical-sm space-y-6">
            <h3 className="font-serif text-xl font-semibold text-botanical-forest flex items-center gap-2">
              <MapPin className="w-5 h-5 text-botanical-terracotta" />
              <span>Bespoke Shipping Address &amp; Delivery Pin</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  House / Unit / Building &amp; Street Address
                </label>
                <input
                  type="text"
                  placeholder="Unit 14A, Grand Emerald Tower, Garnet Rd"
                  value={formData.address.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                  className="w-full px-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest focus:ring-1 focus:ring-botanical-forest transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Barangay
                </label>
                <input
                  type="text"
                  placeholder="San Antonio"
                  value={formData.address.barangay}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, barangay: e.target.value }
                  })}
                  className="w-full px-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  City / Municipality
                </label>
                <input
                  type="text"
                  placeholder="Pasig City"
                  value={formData.address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value }
                  })}
                  className="w-full px-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Province
                </label>
                <input
                  type="text"
                  placeholder="Metro Manila"
                  value={formData.address.province}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, province: e.target.value }
                  })}
                  className="w-full px-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="1605"
                  value={formData.address.postalCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, postalCode: e.target.value }
                  })}
                  className="w-full px-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest"
                />
              </div>
            </div>

            {/* Interactive Leaflet Pinpoint Map */}
            <div className="pt-2">
              <InteractiveAddressMap
                initialLocation={formData.location}
                onLocationChange={handleLocationChange}
              />
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="py-4 px-10 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-botanical-md flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 text-botanical-sage" />
                  <span>Save Atelier Profile</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};
