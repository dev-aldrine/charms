import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Package, LogOut, ExternalLink, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatPHP } from '../../utils/formatters';

export const AccountDrawer = () => {
  const { user, isAccountDrawerOpen, closeAccountDrawer, logout } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isAccountDrawerOpen && user?.email) {
      fetchOrders();
    }
  }, [isAccountDrawerOpen, user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/auth/user-orders?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isAccountDrawerOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAccountDrawer}
          className="absolute inset-0 bg-botanical-forest/50 backdrop-blur-xs"
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-botanical-bg border-l border-botanical-stone shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-botanical-stone/80 bg-white/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-botanical-forest text-white flex items-center justify-center font-serif text-base font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-botanical-forest">
                    {user?.name || 'Customer Account'}
                  </h3>
                  <p className="text-xs text-botanical-forest/60 font-mono">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={closeAccountDrawer}
                className="w-8 h-8 rounded-full border border-botanical-stone flex items-center justify-center text-botanical-forest hover:bg-botanical-stone transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: Order History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-botanical-sage" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-botanical-forest">
                    Order History ({orders.length})
                  </span>
                </div>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-botanical-forest/60">
                  Loading your atelier orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-white rounded-3xl p-6 border border-botanical-stone">
                  <div className="w-12 h-12 mx-auto rounded-full bg-botanical-bg flex items-center justify-center text-botanical-sage">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-medium text-botanical-forest">No orders placed yet</h4>
                  <p className="text-xs text-botanical-forest/60 leading-relaxed font-sans">
                    When you order handcrafted mineral bracelets, your tracking and status will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.orderNumber}
                      className="bg-white rounded-2xl p-4 border border-botanical-stone space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-botanical-stone/40 pb-2.5">
                        <div>
                          <span className="font-mono text-xs font-bold text-botanical-forest">
                            #{order.orderNumber}
                          </span>
                          <div className="text-[10px] text-botanical-forest/50">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs text-botanical-forest">
                            <span className="truncate pr-2">{item.name} {item.wristSize ? `(${item.wristSize}cm)` : ''} x{item.quantity || 1}</span>
                            <span className="font-mono font-medium">{formatPHP(item.price * (item.quantity || 1))}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-botanical-stone/40 text-xs">
                        <span className="text-botanical-forest/60">Grand Total:</span>
                        <span className="font-serif font-bold text-botanical-forest">{formatPHP(order.grandTotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-botanical-stone/80 bg-white/70">
              <button
                onClick={logout}
                className="w-full py-3 px-4 rounded-full border border-botanical-stone hover:border-red-300 hover:bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Atelier</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
