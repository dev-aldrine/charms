import { create } from 'zustand';
import { BRACELET_CATALOG } from '../data/catalogData';

export const useProductStore = create((set, get) => ({
  products: BRACELET_CATALOG,
  loading: false,
  error: null,
  isInitialized: false,

  // Fetch all products from Server API (with local catalog fallback)
  fetchProducts: async (includeInactive = false) => {
    set({ loading: true, error: null });
    try {
      const query = includeInactive ? '?includeInactive=true' : '';
      const res = await fetch(`/api/products${query}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        set({ products: data.products, loading: false, isInitialized: true });
        return data.products;
      } else {
        // Fallback to initial catalog
        set({ products: BRACELET_CATALOG, loading: false, isInitialized: true });
        return BRACELET_CATALOG;
      }
    } catch (err) {
      console.warn('Using client catalog fallback:', err.message);
      set({ products: BRACELET_CATALOG, loading: false, isInitialized: true });
      return BRACELET_CATALOG;
    }
  },

  // Create Product (Admin)
  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create product');
      }

      set((state) => ({
        products: [data.product, ...state.products],
        loading: false
      }));
      return { success: true, product: data.product };
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  // Update Product (Admin)
  updateProduct: async (id, updatedFields) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update product');
      }

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? data.product : p)),
        loading: false
      }));
      return { success: true, product: data.product };
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  // Delete Product (Admin)
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete product');
      }

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false
      }));
      return { success: true };
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  }
}));
