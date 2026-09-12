import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  CheckCircle2, 
  Check, 
  X,
  Clock, 
  ShieldCheck, 
  Package, 
  ArrowLeft, 
  Sparkles,
  Loader2,
  Upload,
  Image as ImageIcon,
  KeyRound,
  QrCode,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { InteractiveAddressMap } from '../components/profile/InteractiveAddressMap';
import { formatPHP } from '../utils/formatters';
import { PHILIPPINES_REGIONS_PROVINCES } from '../data/philippineAddresses';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=compress&cs=tinysrgb&w=150',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=compress&cs=tinysrgb&w=150',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=compress&cs=tinysrgb&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=compress&cs=tinysrgb&w=150'
];

export const ProfilePage = ({ onBack, onSelectProduct }) => {
  const { user, updateProfile, fetchProfile, setup2FA, enable2FA, disable2FA, loading } = useAuthStore();

  // 2FA Management State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFaSetupData, setTwoFaSetupData] = useState(null);
  const [twoFaCodeInput, setTwoFaCodeInput] = useState('');
  const [twoFaDisablePassword, setTwoFaDisablePassword] = useState('');
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState('');

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

  const [savingSection, setSavingSection] = useState(null); // 'avatar' | 'contact' | 'address' | 'all'
  const [savedSection, setSavedSection] = useState(null);
  const [toasts, setToasts] = useState([]); // Array of { id, title, message }
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showAvatarChooser, setShowAvatarChooser] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setAvatarUploadError('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    setAvatarUploadError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to upload image');
      }

      const uploadedUrl = data.url;
      setFormData(prev => ({ ...prev, avatarUrl: uploadedUrl }));
      setShowAvatarChooser(false);

      // Auto-save the new avatar to MongoDB
      await updateProfile({ avatarUrl: uploadedUrl });
      setSavedSection('avatar');
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSection(null);
        setSavedSuccess(false);
      }, 2500);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAvatarUploadError(err.message || 'Image upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

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

  // Validation function
  const validateForm = (section = 'all') => {
    const errs = {};

    if (section === 'contact' || section === 'all') {
      // Name validation
      if (!formData.name || !formData.name.trim()) {
        errs.name = 'Full name is required';
      } else if (formData.name.trim().length < 2) {
        errs.name = 'Name must be at least 2 characters';
      }

      // Phone validation
      if (formData.phone && formData.phone.trim()) {
        const cleanedPhone = formData.phone.replace(/[\s\-()]/g, '');
        const phoneRegex = /^(09|\+639|639|9)\d{9}$/;
        if (!phoneRegex.test(cleanedPhone)) {
          errs.phone = 'Enter a valid Philippine mobile number (e.g. 09171234567)';
        }
      }
    }

    if (section === 'address' || section === 'all') {
      // Street address
      if (formData.address.street && formData.address.street.trim().length < 5) {
        errs.street = 'Please provide a complete street/building address (at least 5 characters)';
      }

      // Postal code validation
      if (formData.address.postalCode && formData.address.postalCode.trim()) {
        const postalRegex = /^\d{4}$/;
        if (!postalRegex.test(formData.address.postalCode.trim())) {
          errs.postalCode = 'Postal code must be a 4-digit number (e.g. 1605)';
        }
      }
    }

    setErrors(prev => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  // Dirty State Checking: Only allow saving if fields actually changed
  const isContactDirty = Boolean(
    (formData.name || '') !== (user?.name || '') ||
    (formData.phone || '') !== (user?.phone || '')
  );

  const isAddressDirty = Boolean(
    (formData.address.street || '') !== (user?.address?.street || '') ||
    (formData.address.barangay || '') !== (user?.address?.barangay || '') ||
    (formData.address.city || '') !== (user?.address?.city || '') ||
    (formData.address.province || '') !== (user?.address?.province || 'Metro Manila') ||
    (formData.address.postalCode || '') !== (user?.address?.postalCode || '') ||
    (formData.address.notes || '') !== (user?.address?.notes || '') ||
    Math.abs((formData.location?.lat || 0) - (user?.location?.lat || 0)) > 0.0001 ||
    Math.abs((formData.location?.lng || 0) - (user?.location?.lng || 0)) > 0.0001
  );

  const isAllDirty = isContactDirty || isAddressDirty || ((formData.avatarUrl || '') !== (user?.avatarUrl || ''));

  const addToast = (title, message) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveSection = async (section = 'all') => {
    if (section === 'contact' && !isContactDirty) return;
    if (section === 'address' && !isAddressDirty) return;
    if (section === 'all' && !isAllDirty) return;

    if (!validateForm(section)) {
      return;
    }
    setSavingSection(section);

    // Minimum visual loading duration (550ms) for smooth natural feedback
    const [success] = await Promise.all([
      updateProfile(formData),
      new Promise(resolve => setTimeout(resolve, 550))
    ]);

    setSavingSection(null);

    if (success) {
      setSavedSection(section);
      let title = 'Saved Successfully';
      let msg = 'Your atelier profile has been updated.';
      if (section === 'contact') {
        title = 'Contact Details Updated';
        msg = 'Your name and contact phone are securely saved.';
      } else if (section === 'address') {
        title = 'Shipping Address Pinned';
        msg = 'Delivery destination and map location saved.';
      } else if (section === 'avatar') {
        title = 'Avatar Updated';
        msg = 'Your atelier profile photo is now active.';
      }
      
      addToast(title, msg);

      setTimeout(() => {
        setSavedSection(null);
      }, 2500);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    await handleSaveSection('all');
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
      </div>

      {/* Floating Stacking White Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
              className="pointer-events-auto flex items-start gap-3 bg-white text-botanical-forest p-4 rounded-2xl shadow-xl border border-botanical-stone/80 backdrop-blur-md"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-semibold text-botanical-forest font-serif">{toast.title}</p>
                <p className="text-[11px] text-botanical-forest/70 font-sans mt-0.5 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-botanical-forest/40 hover:text-botanical-forest transition-colors shrink-0 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
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
                className="p-4 bg-botanical-bg rounded-2xl border border-botanical-stone space-y-4 text-left shadow-md"
              >
                {/* 1. Upload from Device */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-botanical-forest/80 block mb-2">
                    Upload From Device:
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-dashed border-botanical-forest/40 bg-white hover:bg-botanical-stone/30 cursor-pointer text-xs font-semibold text-botanical-forest transition-colors">
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-botanical-terracotta" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-botanical-sage" />
                        <span>Choose Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      disabled={uploadingAvatar}
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                  </label>
                  {avatarUploadError && (
                    <p className="text-[10px] text-red-500 font-sans mt-1">{avatarUploadError}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-botanical-stone" />
                  <span className="text-[10px] uppercase tracking-wider text-botanical-forest/50 font-bold">OR</span>
                  <div className="flex-1 h-px bg-botanical-stone" />
                </div>

                {/* 2. Preset Avatars */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-botanical-forest/80 block mb-1.5">
                    Select Preset:
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
                        className="w-9 h-9 rounded-full overflow-hidden border border-botanical-stone hover:ring-2 hover:ring-botanical-forest transition-all hover:scale-105"
                      >
                        <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Image URL */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-botanical-forest/80 block mb-1">
                    Or Web Image URL:
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
                    className="w-full px-3 py-1.5 rounded-xl border border-botanical-stone text-xs font-sans bg-white focus:outline-none focus:border-botanical-forest"
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
                <span className="font-bold text-botanical-forest block text-base font-serif capitalize">
                  {user?.role === 'admin' ? 'Administrator' : 'Client'}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-botanical-sage font-bold">
                  {user?.role === 'admin' ? 'Atelier Studio Staff' : 'Atelier Circle'}
                </span>
              </div>
            </div>

            {/* Quick Link to Admin Studio if Admin */}
            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  window.history.pushState({}, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-botanical-terracotta/40 bg-botanical-terracotta/10 hover:bg-botanical-terracotta text-botanical-terracotta hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Admin Studio</span>
              </button>
            )}

            {/* Avatar Card Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSaveSection('avatar')}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-botanical-stone bg-botanical-bg hover:bg-botanical-stone text-botanical-forest text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-95"
              >
                {loading && savedSection === 'avatar' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : savedSection === 'avatar' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Avatar Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-botanical-sage" />
                    <span>Save Avatar</span>
                  </>
                )}
              </button>
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

          {/* Security & 2-Factor Authentication Card */}
          <div className="bg-white rounded-3xl p-6 border border-botanical-stone shadow-botanical-sm space-y-4">
            <div className="flex items-center justify-between border-b border-botanical-stone/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-botanical-sage" />
                <h3 className="font-serif text-base font-semibold text-botanical-forest">
                  Two-Factor Authentication
                </h3>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                user?.isTwoFactorEnabled 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-botanical-bg text-botanical-forest/60 border border-botanical-stone'
              }`}>
                {user?.isTwoFactorEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>

            <p className="text-xs text-botanical-forest/70 font-sans leading-relaxed">
              {user?.isTwoFactorEnabled
                ? 'Your account is secured with Google Authenticator. An authenticator code is required when signing in.'
                : 'Protect your account using standard Google Authenticator or Authy. No SMS or email OTPs required.'}
            </p>

            {user?.isTwoFactorEnabled ? (
              <button
                type="button"
                onClick={() => {
                  setTwoFaError('');
                  setTwoFaDisablePassword('');
                  setShow2FAModal('disable');
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Disable 2FA</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  setTwoFaError('');
                  setTwoFaCodeInput('');
                  setTwoFaLoading(true);
                  setShow2FAModal('setup');
                  const setupData = await setup2FA();
                  setTwoFaSetupData(setupData);
                  setTwoFaLoading(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-botanical-forest bg-botanical-forest hover:bg-botanical-terracotta text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Enable Authenticator 2FA</span>
              </button>
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

        {/* 2FA Setup / Disable Modal */}
        <AnimatePresence>
          {show2FAModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-forest/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-botanical-stone shadow-2xl space-y-5"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShow2FAModal(false);
                    setTwoFaSetupData(null);
                    setTwoFaError('');
                  }}
                  className="absolute right-5 top-5 w-8 h-8 rounded-full border border-botanical-stone flex items-center justify-center text-botanical-forest/60 hover:text-botanical-forest hover:bg-botanical-bg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {show2FAModal === 'setup' ? (
                  <div className="space-y-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-botanical-bg border border-botanical-stone flex items-center justify-center mx-auto text-botanical-forest shadow-xs">
                      <QrCode className="w-5 h-5 text-botanical-sage" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-botanical-forest">
                        Link Authenticator App
                      </h3>
                      <p className="text-xs text-botanical-forest/70 font-sans mt-1">
                        Scan with Google Authenticator, Authy, or Apple Keychain
                      </p>
                    </div>

                    {twoFaLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-botanical-terracotta" />
                        <span className="text-xs text-botanical-forest/60">Generating your unique key...</span>
                      </div>
                    ) : twoFaSetupData ? (
                      <div className="space-y-4">
                        {/* QR Code Container */}
                        <div className="p-3 bg-white border border-botanical-stone rounded-2xl shadow-inner inline-block mx-auto">
                          <img
                            src={twoFaSetupData.qrCodeUrl}
                            alt="2FA QR Code"
                            className="w-44 h-44 mx-auto rounded-lg"
                          />
                        </div>

                        {/* Secret manual backup key */}
                        <div className="p-3 bg-botanical-bg rounded-xl border border-botanical-stone text-left">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-botanical-forest/60">
                            Or enter secret key manually:
                          </p>
                          <p className="font-mono text-xs font-bold text-botanical-forest tracking-wider select-all mt-1 break-all">
                            {twoFaSetupData.secret}
                          </p>
                        </div>

                        {/* Verification code input */}
                        <div className="space-y-2 text-left">
                          <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                            Enter 6-Digit Authenticator Code:
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            value={twoFaCodeInput}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setTwoFaCodeInput(val);
                              setTwoFaError('');
                            }}
                            className="w-full text-center text-xl font-mono tracking-widest py-3 px-4 rounded-xl border border-botanical-stone bg-white focus:outline-none focus:border-botanical-forest"
                          />
                        </div>

                        {twoFaError && (
                          <p className="text-xs text-red-500 font-sans">{twoFaError}</p>
                        )}

                        <button
                          type="button"
                          disabled={twoFaCodeInput.length !== 6 || twoFaLoading}
                          onClick={async () => {
                            setTwoFaLoading(true);
                            setTwoFaError('');
                            try {
                              await enable2FA(twoFaCodeInput);
                              setShow2FAModal(false);
                              addToast('Two-Factor Authentication Enabled', 'Your account is now protected with 2FA.');
                            } catch (err) {
                              setTwoFaError(err.message || 'Invalid 6-digit code. Please try again.');
                            } finally {
                              setTwoFaLoading(false);
                            }
                          }}
                          className="w-full py-3.5 px-4 rounded-xl bg-botanical-forest hover:bg-botanical-terracotta disabled:bg-botanical-stone disabled:text-botanical-forest/40 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
                        >
                          {twoFaLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Confirm &amp; Enable 2FA</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  /* Disable 2FA confirmation */
                  <div className="space-y-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-xs">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-botanical-forest">
                        Disable Two-Factor Authentication
                      </h3>
                      <p className="text-xs text-botanical-forest/70 font-sans mt-1">
                        Please confirm your account password to remove 2FA protection.
                      </p>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                        Current Password:
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={twoFaDisablePassword}
                        onChange={(e) => {
                          setTwoFaDisablePassword(e.target.value);
                          setTwoFaError('');
                        }}
                        className="w-full py-3 px-4 rounded-xl border border-botanical-stone bg-white text-xs font-sans focus:outline-none focus:border-botanical-forest"
                      />
                    </div>

                    {twoFaError && (
                      <p className="text-xs text-red-500 font-sans">{twoFaError}</p>
                    )}

                    <button
                      type="button"
                      disabled={!twoFaDisablePassword || twoFaLoading}
                      onClick={async () => {
                        setTwoFaLoading(true);
                        setTwoFaError('');
                        try {
                          await disable2FA(twoFaDisablePassword);
                          setShow2FAModal(false);
                          addToast('2FA Disabled', 'Two-factor authentication has been turned off.');
                        } catch (err) {
                          setTwoFaError(err.message || 'Incorrect password.');
                        } finally {
                          setTwoFaLoading(false);
                        }
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-botanical-stone disabled:text-botanical-forest/40 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      {twoFaLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Confirm Disable</span>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Right 2 Columns: Editable Details & Interactive Leaflet Map */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Contact Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-botanical-stone shadow-botanical-sm space-y-6">
            <div className="flex items-center justify-between border-b border-botanical-stone/60 pb-4">
              <h3 className="font-serif text-xl font-semibold text-botanical-forest flex items-center gap-2">
                <User className="w-5 h-5 text-botanical-sage" />
                <span>Personal &amp; Contact Details</span>
              </h3>
              <motion.button
                layout
                layoutRoot
                whileHover={isContactDirty && !savingSection ? { scale: 1.03 } : {}}
                whileTap={isContactDirty && !savingSection ? { scale: 0.96 } : {}}
                transition={{ 
                  layout: { type: "spring", stiffness: 350, damping: 25 },
                  duration: 0.35
                }}
                type="button"
                onClick={() => handleSaveSection('contact')}
                disabled={savingSection !== null || !isContactDirty}
                className={`py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-xs overflow-hidden ${
                  isContactDirty
                    ? 'bg-botanical-forest hover:bg-botanical-terracotta text-white cursor-pointer'
                    : 'bg-botanical-stone/70 text-botanical-forest/40 cursor-not-allowed shadow-none'
                }`}
              >
                <motion.div layout className="flex items-center gap-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {savingSection === 'contact' ? (
                      <motion.div
                        key="saving"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-botanical-sage" />
                        <span>Saving...</span>
                      </motion.div>
                    ) : savedSection === 'contact' ? (
                      <motion.div
                        key="saved"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 text-emerald-300 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Saved!</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        <Save className={`w-3.5 h-3.5 ${isContactDirty ? 'text-botanical-sage' : 'text-botanical-forest/30'}`} />
                        <span>Save Contact</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-botanical-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Maria Santos"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl border ${
                      errors.name ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-botanical-stone'
                    } text-xs font-sans focus:outline-none focus:border-botanical-forest focus:ring-1 focus:ring-botanical-forest transition-all`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-red-500 font-sans mt-1.5 ml-1">{errors.name}</p>
                )}
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
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl border ${
                      errors.phone ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-botanical-stone'
                    } text-xs font-sans focus:outline-none focus:border-botanical-forest focus:ring-1 focus:ring-botanical-forest transition-all`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-red-500 font-sans mt-1.5 ml-1">{errors.phone}</p>
                )}
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
            <div className="flex items-center justify-between border-b border-botanical-stone/60 pb-4">
              <h3 className="font-serif text-xl font-semibold text-botanical-forest flex items-center gap-2">
                <MapPin className="w-5 h-5 text-botanical-terracotta" />
                <span>Shipping Address &amp; Delivery Pin</span>
              </h3>
              <motion.button
                layout
                layoutRoot
                whileHover={isAddressDirty && !savingSection ? { scale: 1.03 } : {}}
                whileTap={isAddressDirty && !savingSection ? { scale: 0.96 } : {}}
                transition={{ 
                  layout: { type: "spring", stiffness: 350, damping: 25 },
                  duration: 0.35
                }}
                type="button"
                onClick={() => handleSaveSection('address')}
                disabled={savingSection !== null || !isAddressDirty}
                className={`py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-xs overflow-hidden ${
                  isAddressDirty
                    ? 'bg-botanical-forest hover:bg-botanical-terracotta text-white cursor-pointer'
                    : 'bg-botanical-stone/70 text-botanical-forest/40 cursor-not-allowed shadow-none'
                }`}
              >
                <motion.div layout className="flex items-center gap-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {savingSection === 'address' ? (
                      <motion.div
                        key="saving"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-botanical-sage" />
                        <span>Saving...</span>
                      </motion.div>
                    ) : savedSection === 'address' ? (
                      <motion.div
                        key="saved"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 text-emerald-300 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Saved!</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        <Save className={`w-3.5 h-3.5 ${isAddressDirty ? 'text-botanical-sage' : 'text-botanical-forest/30'}`} />
                        <span>Save Address</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  House / Unit / Building &amp; Street Address
                </label>
                <input
                  type="text"
                  placeholder="Unit 14A, Grand Emerald Tower, Garnet Rd"
                  value={formData.address.street}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    });
                    if (errors.street) setErrors({ ...errors, street: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.street ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-botanical-stone'
                  } text-xs font-sans focus:outline-none focus:border-botanical-forest focus:ring-1 focus:ring-botanical-forest transition-all`}
                />
                {errors.street && (
                  <p className="text-[11px] text-red-500 font-sans mt-1.5 ml-1">{errors.street}</p>
                )}
              </div>

              {/* Province Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Province / Region
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="province-options"
                    placeholder="Select or type province (e.g. Metro Manila)"
                    value={formData.address.province}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          province: newProv
                        }
                      });
                    }}
                    className="w-full px-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white/70"
                  />
                  <datalist id="province-options">
                    {PHILIPPINES_REGIONS_PROVINCES.map((p) => (
                      <option key={p.province} value={p.province} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* City / Municipality Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  City / Municipality
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="city-options"
                    placeholder="Select or type city (e.g. Pasig City)"
                    value={formData.address.city}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      // Find matching city across all provinces or selected province
                      let matchedZip = '';
                      const activeProvObj = PHILIPPINES_REGIONS_PROVINCES.find(
                        p => p.province.toLowerCase() === formData.address.province?.toLowerCase()
                      );
                      const cityPool = activeProvObj ? activeProvObj.cities : PHILIPPINES_REGIONS_PROVINCES.flatMap(p => p.cities);
                      const matchedCity = cityPool.find(c => c.name.toLowerCase() === newCity.toLowerCase());
                      
                      if (matchedCity) {
                        matchedZip = matchedCity.zip;
                        // Also auto-infer province if not set
                        const parentProv = PHILIPPINES_REGIONS_PROVINCES.find(p => p.cities.some(c => c.name.toLowerCase() === newCity.toLowerCase()));
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            city: matchedCity.name,
                            province: parentProv ? parentProv.province : formData.address.province,
                            postalCode: matchedZip || formData.address.postalCode
                          }
                        });
                      } else {
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: newCity }
                        });
                      }
                      if (errors.postalCode && matchedZip) setErrors({ ...errors, postalCode: '' });
                    }}
                    className="w-full px-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white/70"
                  />
                  <datalist id="city-options">
                    {(() => {
                      const activeProv = PHILIPPINES_REGIONS_PROVINCES.find(
                        p => p.province.toLowerCase() === formData.address.province?.toLowerCase()
                      );
                      const citiesToList = activeProv ? activeProv.cities : PHILIPPINES_REGIONS_PROVINCES.flatMap(p => p.cities);
                      return citiesToList.map((c) => (
                        <option key={c.name} value={c.name}>{`Postal Code: ${c.zip}`}</option>
                      ));
                    })()}
                  </datalist>
                </div>
              </div>

              {/* Barangay Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Barangay
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="barangay-options"
                    placeholder="Select or type Barangay"
                    value={formData.address.barangay}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, barangay: e.target.value }
                    })}
                    className="w-full px-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white/70"
                  />
                  <datalist id="barangay-options">
                    {(() => {
                      const activeProv = PHILIPPINES_REGIONS_PROVINCES.find(
                        p => p.province.toLowerCase() === formData.address.province?.toLowerCase()
                      );
                      const cityPool = activeProv ? activeProv.cities : PHILIPPINES_REGIONS_PROVINCES.flatMap(p => p.cities);
                      const activeCity = cityPool.find(
                        c => c.name.toLowerCase() === formData.address.city?.toLowerCase()
                      );
                      const barangaysToList = activeCity ? activeCity.barangays : [];
                      return barangaysToList.map((b) => (
                        <option key={b} value={b} />
                      ));
                    })()}
                  </datalist>
                </div>
              </div>

              {/* Postal Code (Auto-Prefilled with manual override) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                    Postal Code
                  </label>
                  <span className="text-[10px] text-botanical-sage uppercase font-medium">Auto-resolved</span>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="1605"
                  value={formData.address.postalCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({
                      ...formData,
                      address: { ...formData.address, postalCode: val }
                    });
                    if (errors.postalCode) setErrors({ ...errors, postalCode: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.postalCode ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-botanical-stone'
                  } text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white/70`}
                />
                {errors.postalCode && (
                  <p className="text-[11px] text-red-500 font-sans mt-1.5 ml-1">{errors.postalCode}</p>
                )}
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
              layout
              layoutRoot
              whileHover={isAllDirty && !savingSection ? { scale: 1.03 } : {}}
              whileTap={isAllDirty && !savingSection ? { scale: 0.97 } : {}}
              transition={{ 
                layout: { type: "spring", stiffness: 350, damping: 25 },
                duration: 0.35
              }}
              type="submit"
              disabled={savingSection !== null || !isAllDirty}
              className={`py-4 px-10 rounded-full font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-botanical-md flex items-center justify-center gap-2 overflow-hidden ${
                isAllDirty
                  ? 'bg-botanical-forest hover:bg-botanical-terracotta text-white cursor-pointer'
                  : 'bg-botanical-stone/70 text-botanical-forest/40 cursor-not-allowed shadow-none'
              }`}
            >
              <motion.div layout className="flex items-center gap-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  {savingSection === 'all' ? (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-botanical-sage" />
                      <span>Saving Profile...</span>
                    </motion.div>
                  ) : savedSection === 'all' ? (
                    <motion.div
                      key="saved"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 text-emerald-300 whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Profile Saved!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Save className={`w-4 h-4 ${isAllDirty ? 'text-botanical-sage' : 'text-botanical-forest/30'}`} />
                      <span>Save Atelier Profile</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};
