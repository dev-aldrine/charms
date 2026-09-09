import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../store/useCartStore';
import { formatPHP, getWristCategory } from '../utils/formatters';

describe('Aura & Botanica Utilities & Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('formats currency correctly in PHP (₱)', () => {
    const formatted = formatPHP(2450);
    expect(formatted).toContain('2,450.00');
  });

  it('calculates wrist size categories correctly', () => {
    expect(getWristCategory(14).label).toBe('Petite / XS');
    expect(getWristCategory(16).label).toBe('Small / Standard Women');
    expect(getWristCategory(18).label).toBe('Medium / Standard Men');
    expect(getWristCategory(20).label).toBe('Large / Relaxed Fit');
  });

  it('adds items to cart and calculates shipping and totals', () => {
    const { addItem, getSubtotal, getShippingFee, getGrandTotal } = useCartStore.getState();

    addItem({
      id: 'prod_1',
      name: 'Verdant Jade',
      price: 2450,
      wristSize: 16,
      quantity: 1
    });

    expect(useCartStore.getState().items.length).toBe(1);
    expect(getSubtotal()).toBe(2450);
    expect(getShippingFee()).toBe(150); // Under 3000 threshold
    expect(getGrandTotal()).toBe(2600);

    // Add another to exceed ₱3000 threshold for free shipping
    addItem({
      id: 'prod_2',
      name: 'Aura Rose Quartz',
      price: 1000,
      wristSize: 16,
      quantity: 1
    });

    expect(getSubtotal()).toBe(3450);
    expect(getShippingFee()).toBe(0); // Free shipping unlocked
    expect(getGrandTotal()).toBe(3450);
  });
});
