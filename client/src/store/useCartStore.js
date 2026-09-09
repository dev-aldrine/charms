import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  isCartOpen: false,
  isCheckoutOpen: false,
  isWristGuideOpen: false,
  activeOrder: null,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  openCheckout: () => set({ isCheckoutOpen: true, isCartOpen: false }),
  closeCheckout: () => set({ isCheckoutOpen: false }),

  openWristGuide: () => set({ isWristGuideOpen: true }),
  closeWristGuide: () => set({ isWristGuideOpen: false }),

  setActiveOrder: (order) => set({ activeOrder: order }),

  addItem: (item) => set((state) => {
    // Generate unique key based on id, wristSize, and custom attributes
    const itemKey = `${item.id}-${item.wristSize || 'std'}-${item.engravingText || ''}-${(item.selectedGemstones || []).join('-')}`;
    const existingIndex = state.items.findIndex(i => i.itemKey === itemKey);

    if (existingIndex > -1) {
      const updated = [...state.items];
      updated[existingIndex].quantity += item.quantity || 1;
      return { items: updated, isCartOpen: true };
    } else {
      return {
        items: [...state.items, { ...item, itemKey, quantity: item.quantity || 1 }],
        isCartOpen: true
      };
    }
  }),

  removeItem: (itemKey) => set((state) => ({
    items: state.items.filter(item => item.itemKey !== itemKey)
  })),

  updateQuantity: (itemKey, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(item => item.itemKey !== itemKey) };
    }
    return {
      items: state.items.map(item =>
        item.itemKey === itemKey ? { ...item, quantity } : item
      )
    };
  }),

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getShippingFee: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal > 3000 ? 0 : 150; // Free shipping over ₱3,000
  },

  getGrandTotal: () => {
    return get().getSubtotal() + get().getShippingFee();
  }
}));
