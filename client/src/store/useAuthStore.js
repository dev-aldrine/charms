import { create } from 'zustand';

const STORAGE_KEY = 'joys_auth_session';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'),
  isAuthModalOpen: false,
  isAccountDrawerOpen: false,
  authStep: 'email', // 'email', 'otp', 'success'
  pendingEmail: '',
  loading: false,
  error: null,
  devCodeNotice: null,

  openAuthModal: (initialEmail = '') => set({
    isAuthModalOpen: true,
    pendingEmail: initialEmail,
    authStep: 'email',
    error: null,
    devCodeNotice: null
  }),

  closeAuthModal: () => set({
    isAuthModalOpen: false,
    authStep: 'email',
    error: null,
    devCodeNotice: null
  }),

  openAccountDrawer: () => set({ isAccountDrawerOpen: true }),
  closeAccountDrawer: () => set({ isAccountDrawerOpen: false }),

  // Step 1: Send OTP
  sendOtp: async (email) => {
    set({ loading: true, error: null, devCodeNotice: null });
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      set({
        loading: false,
        pendingEmail: email,
        authStep: 'otp',
        devCodeNotice: data.devCode || null
      });
      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },

  // Step 2: Verify OTP
  verifyOtp: async (code, name = '') => {
    const { pendingEmail } = get();
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code, name })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid code');
      }

      const userData = data.user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      set({
        user: userData,
        loading: false,
        authStep: 'success'
      });

      setTimeout(() => {
        set({ isAuthModalOpen: false, authStep: 'email' });
      }, 1500);

      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },

  // Fetch Profile
  fetchProfile: async () => {
    const { user } = get();
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        set({ user: data.user });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  },

  // Update Profile
  updateProfile: async (updatedData) => {
    const { user } = get();
    if (!user?.email) return false;
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...updatedData })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      const freshUser = data.user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshUser));
      set({ user: freshUser, loading: false });
      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, isAccountDrawerOpen: false });
  }
}));
