import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { formatPHP } from '../../utils/formatters';

export const CartDrawer = () => {
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    getSubtotal, 
    getShippingFee, 
    getGrandTotal,
    openCheckout 
  } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const grandTotal = getGrandTotal();
  const freeShippingThreshold = 3000;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="absolute inset-0 bg-botanical-forest/40 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Animated Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="w-screen max-w-md bg-botanical-bg shadow-2xl border-l border-botanical-stone flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-botanical-stone bg-white/60 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-2xl font-semibold text-botanical-forest">
                      Your Bespoke Bag
                    </h2>
                    <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-botanical-stone text-botanical-forest font-medium">
                      {items.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  </div>
                  <button
                    onClick={closeCart}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-botanical-stone transition-colors text-botanical-forest"
                    aria-label="Close Cart"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Free Shipping Progress Indicator */}
                <div className="mt-4 pt-3 border-t border-botanical-stone/50">
                  <div className="flex items-center justify-between text-xs text-botanical-forest/80 mb-1.5 font-medium">
                    {subtotal >= freeShippingThreshold ? (
                      <span className="text-botanical-forest font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-botanical-sage" /> You unlocked free express shipping!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-botanical-terracotta">{formatPHP(freeShippingThreshold - subtotal)}</strong> for Free Shipping
                      </span>
                    )}
                    <span>{Math.round(progressToFreeShipping)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-botanical-stone rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-botanical-sage"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToFreeShipping}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              {/* Cart Item List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-botanical-forest/60">
                    <div className="w-16 h-16 rounded-full bg-botanical-clay/30 flex items-center justify-center mb-4 text-botanical-sage">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <p className="font-serif text-xl font-medium text-botanical-forest">
                      Your bag is currently empty
                    </p>
                    <p className="text-xs font-sans mt-2 max-w-xs leading-relaxed">
                      Discover our curated gemstone bracelets or design a bespoke talisman in the Custom Studio.
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.itemKey}
                      className="bg-white rounded-2xl p-4 border border-botanical-stone shadow-botanical-sm flex gap-4 transition-all hover:shadow-botanical-md"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover bg-botanical-bg"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-serif text-sm font-semibold text-botanical-forest leading-snug">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.itemKey)}
                              className="text-botanical-forest/40 hover:text-botanical-terracotta transition-colors ml-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Variant Specs */}
                          <div className="text-[11px] text-botanical-forest/70 font-sans mt-1 space-y-0.5">
                            {item.wristSize && <div>Size: <strong>{item.wristSize}cm</strong></div>}
                            {item.engravingText && (
                              <div className="text-botanical-terracotta font-medium">
                                Engraved: "{item.engravingText}"
                              </div>
                            )}
                            {item.isCustom && item.cord && <div>Cord: {item.cord}</div>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-botanical-stone/40">
                          <div className="flex items-center gap-2 border border-botanical-stone rounded-full px-2 py-0.5 bg-botanical-bg">
                            <button
                              onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                              className="text-botanical-forest/60 hover:text-botanical-forest"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold text-botanical-forest w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                              className="text-botanical-forest/60 hover:text-botanical-forest"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-serif text-sm font-semibold text-botanical-forest">
                            {formatPHP(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer Checkout Summary */}
              {items.length > 0 && (
                <div className="p-6 border-t border-botanical-stone bg-white/90 backdrop-blur-md space-y-4">
                  <div className="space-y-1.5 text-xs text-botanical-forest/80 font-sans">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatPHP(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Express Insured Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? <strong className="text-botanical-forest">FREE</strong> : formatPHP(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-serif font-semibold text-botanical-forest pt-2 border-t border-botanical-stone">
                      <span>Grand Total (PHP)</span>
                      <span>{formatPHP(grandTotal)}</span>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={openCheckout}
                    className="w-full py-4 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-botanical-md flex items-center justify-center gap-2 group"
                  >
                    <span>Proceed to PayMongo QR Ph</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </motion.button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-botanical-forest/60 uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5 text-botanical-sage" />
                    <span>Protected by PayMongo Philippine QR Standard</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
