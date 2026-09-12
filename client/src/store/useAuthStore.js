import { create } from 'zustand';

const STORAGE_KEY = 'joys_auth_session';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'),
  isAuthModalOpen: false,
  isAccountDrawerOpen: false,
  authMode: 'login', // 'login' | 'register'
  authStep: 'form', // 'form' | 'verify-email' | '2fa' | 'success'
  pendingEmail: '',
  loading: false,
  error: null,
  successNotice: null,

  openAuthModal: (initialMode = 'login', initialEmail = '') => set({
    isAuthModalOpen: true,
    authMode: initialMode,
    pendingEmail: initialEmail,
    authStep: 'form',
    error: null,
    successNotice: null
  }),

  closeAuthModal: () => set({
    isAuthModalOpen: false,
    authStep: 'form',
    error: null,
    successNotice: null
  }),

  setAuthMode: (mode) => set({ authMode: mode, error: null, successNotice: null }),
  openAccountDrawer: () => set({ isAccountDrawerOpen: true }),
  closeAccountDrawer: () => set({ isAccountDrawerOpen: false }),

  // 1. Login with Password
  login: async (email, password) => {
    set({ loading: true, error: null, successNotice: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Check if email verification is required
      if (data.requiresVerification) {
        set({
          loading: false,
          pendingEmail: data.email,
          authStep: 'verify-email',
          successNotice: data.message
        });
        return { requiresVerification: true };
      }

      // Check if 2FA is required
      if (data.requires2FA) {
        set({
          loading: false,
          pendingEmail: data.email,
          authStep: '2fa',
          successNotice: data.message
        });
        return { requires2FA: true };
      }

      // Direct successful login
      const userData = data.user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      set({
        user: userData,
        loading: false,
        authStep: 'success',
        successNotice: 'Welcome back to your Sanctuary!'
      });

      setTimeout(() => {
        set({ isAuthModalOpen: false, authStep: 'form' });
      }, 1200);

      return { success: true };
    } catch (err) {
      set({ loading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  // 2. Register with Password (triggers 1-time email verification)
  register: async (email, password, name = '') => {
    set({ loading: true, error: null, successNotice: null });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      set({
        loading: false,
        pendingEmail: data.email,
        authStep: 'verify-email',
        successNotice: data.message
      });
      return { success: true, requiresVerification: true };
    } catch (err) {
      set({ loading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  // 3. Verify Email Code
  verifyEmail: async (code) => {
    const { pendingEmail } = get();
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code })
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
        authStep: 'success',
        successNotice: 'Email verified successfully!'
      });

      setTimeout(() => {
        set({ isAuthModalOpen: false, authStep: 'form' });
      }, 1400);

      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },

  // 4. Verify 2FA Authenticator Code on Login
  verify2FA: async (token) => {
    const { pendingEmail } = get();
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, token })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid authenticator code');
      }

      const userData = data.user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      set({
        user: userData,
        loading: false,
        authStep: 'success',
        successNotice: 'Two-Factor Authentication verified!'
      });

      setTimeout(() => {
        set({ isAuthModalOpen: false, authStep: 'form' });
      }, 1200);

      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },

  // 5. Resend Email Verification Code
  resendVerificationCode: async () => {
    const { pendingEmail } = get();
    if (!pendingEmail) return false;
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      set({ loading: false, successNotice: 'A new 6-digit code has been sent!' });
      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },

  // 6. Setup 2FA
  setup2FA: async () => {
    const { user } = get();
    if (!user?.email) return null;
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('2FA setup failed:', err);
      return null;
    }
  },

  // 7. Enable 2FA
  enable2FA: async (token) => {
    const { user } = get();
    if (!user?.email) return false;
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, token })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      
      const updatedUser = { ...user, isTwoFactorEnabled: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return true;
    } catch (err) {
      throw err;
    }
  },

  // 8. Disable 2FA
  disable2FA: async (password) => {
    const { user } = get();
    if (!user?.email) return false;
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      const updatedUser = { ...user, isTwoFactorEnabled: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return true;
    } catch (err) {
      throw err;
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
