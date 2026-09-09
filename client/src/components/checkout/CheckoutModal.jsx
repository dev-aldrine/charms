import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Sparkles
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { formatPHP } from '../../utils/formatters';
import { TransitionPanel } from '../core/TransitionPanel';
import { BRAND_CONFIG } from '../../brandConfig';

export const CheckoutModal = () => {
  const { 
    isCheckoutOpen, 
    closeCheckout, 
    items, 
    getGrandTotal, 
    clearCart 
  } = useCartStore();

  const [stepIndex, setStepIndex] = useState(0); // 0: address, 1: qrph, 2: confirmed
  const [formData, setFormData] = useState({
    fullName: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    phone: '09171234567',
    street: 'Unit 12B, Emerald Tower, 45 San Miguel Ave',
    barangay: 'San Antonio',
    city: 'Pasig City',
    province: 'Metro Manila',
    postalCode: '1605'
  });

  const [orderNumber, setOrderNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (isCheckoutOpen && !orderNumber) {
      setOrderNumber(`AB-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isCheckoutOpen]);

  React.useEffect(() => {
    let timer;
    if (stepIndex === 1 && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [stepIndex, timeLeft]);

  if (!isCheckoutOpen) return null;

  const grandTotal = getGrandTotal();

  const handleCreateOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStepIndex(1);
    }, 600);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStepIndex(2);
      clearCart();
    }, 1200);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTimer = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 md:p-8">
        {/* Animated Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCheckout} 
          className="fixed inset-0 bg-botanical-forest/60 backdrop-blur-md" 
        />

        {/* Animated Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative bg-white w-full max-w-2xl rounded-4xl border border-botanical-stone shadow-2xl overflow-hidden z-10"
        >
          {/* Modal Header */}
          <div className="p-6 md:p-8 bg-botanical-bg border-b border-botanical-stone flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-botanical-sage font-bold">
                PayMongo QR Ph Checkout
              </div>
              <h3 className="font-serif text-2xl font-semibold text-botanical-forest mt-0.5">
                {stepIndex === 0 && 'Bespoke Delivery Information'}
                {stepIndex === 1 && 'Scan to Pay with Any Philippine App'}
                {stepIndex === 2 && 'Payment Confirmed & In Crafting'}
              </h3>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={closeCheckout}
              className="w-9 h-9 rounded-full bg-white border border-botanical-stone flex items-center justify-center hover:bg-botanical-stone transition-colors"
            >
              <X className="w-4 h-4 text-botanical-forest" />
            </motion.button>
          </div>

          {/* TransitionPanel for Smooth Step Transitions */}
          <div className="p-6 md:p-8">
            <TransitionPanel activeIndex={stepIndex}>
              {/* STEP 0: Address Form */}
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-botanical-forest/70 font-medium mb-1">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-botanical-bg border border-botanical-stone rounded-2xl px-4 py-2.5 text-sm text-botanical-forest focus:ring-1 focus:ring-botanical-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-botanical-forest/70 font-medium mb-1">
                      Mobile Number (GCash/SMS)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-botanical-bg border border-botanical-stone rounded-2xl px-4 py-2.5 text-sm text-botanical-forest focus:ring-1 focus:ring-botanical-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-botanical-forest/70 font-medium mb-1">
                    Email Address (Official Receipt)
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-botanical-bg border border-botanical-stone rounded-2xl px-4 py-2.5 text-sm text-botanical-forest focus:ring-1 focus:ring-botanical-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-botanical-forest/70 font-medium mb-1">
                    Street Address / Unit No.
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full bg-botanical-bg border border-botanical-stone rounded-2xl px-4 py-2.5 text-sm text-botanical-forest focus:ring-1 focus:ring-botanical-forest"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-botanical-forest/70 font-medium mb-1">
                      Barangay
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.barangay}
                      onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      className="w-full bg-botanical-bg border border-botanical-stone rounded-2xl px-3 py-2 text-sm text-botanical-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-botanical-forest/70 font-medium mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-botanical-bg border border-botanical-stone rounded-2xl px-3 py-2 text-sm text-botanical-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-botanical-forest/70 font-medium mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full bg-botanical-bg border border-botanical-stone rounded-2xl px-3 py-2 text-sm text-botanical-forest"
                    />
                  </div>
                </div>

                {/* Order total review */}
                <div className="bg-botanical-bg rounded-2xl p-4 border border-botanical-stone flex items-center justify-between text-xs">
                  <div>
                    <span className="text-botanical-forest/60 uppercase tracking-widest block">
                      Total Due via QR Ph
                    </span>
                    <span className="font-serif text-xl font-bold text-botanical-forest">
                      {formatPHP(grandTotal)}
                    </span>
                  </div>
                  <div className="text-right text-botanical-forest/70">
                    <span>{items.length} bespoke item(s)</span>
                    <span className="block text-[10px] text-botanical-sage font-semibold">
                      Instant Bank/GCash/Maya Settlement
                    </span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-botanical-md flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Generating QR Ph Code...' : 'Generate Dynamic QR Ph Code'}
                </motion.button>
              </form>

              {/* STEP 1: In-App PayMongo QR Ph Display */}
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex items-center gap-2 bg-botanical-clay/40 px-4 py-1.5 rounded-full text-xs font-semibold text-botanical-forest border border-botanical-stone">
                  <Clock className="w-3.5 h-3.5 text-botanical-terracotta" />
                  <span>QR expires in {formattedTimer}</span>
                </div>

                {/* QR Code Container */}
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative p-6 bg-white rounded-3xl border-2 border-botanical-forest/80 shadow-botanical-xl flex flex-col items-center"
                >
                {/* Official QR Ph Badge & Header */}
                <div className="flex items-center justify-center mb-4">
                  <div className="h-10 w-28 overflow-hidden rounded-xl bg-white shadow-sm border border-botanical-stone">
                    <img
                      src={BRAND_CONFIG.logos.qrPh}
                      alt="Official QR Ph National Standard Logo"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>

                  <div className="relative w-56 h-56 bg-white p-3 rounded-2xl border border-botanical-stone flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PAYMONGO-QRPH-${orderNumber}-${grandTotal}`}
                      alt="PayMongo Dynamic QR Ph Code"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-md border border-botanical-stone flex items-center justify-center p-1">
                        <span className="font-serif font-black text-xs text-botanical-forest tracking-tighter">
                          JOY
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-botanical-stone w-full flex items-center justify-between text-xs">
                    <span className="text-botanical-forest/60 uppercase tracking-widest font-mono">
                      #{orderNumber}
                    </span>
                    <span className="font-serif text-base font-bold text-botanical-forest">
                      {formatPHP(grandTotal)}
                    </span>
                  </div>
                </motion.div>

                {/* Webhook Simulator */}
                <div className="w-full max-w-md pt-4 border-t border-botanical-stone flex flex-col items-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-6 rounded-full bg-botanical-sage hover:bg-botanical-forest text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-botanical-sm flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isProcessing ? 'Verifying HMAC Signature...' : 'Simulate Customer Paid (Test Payment)'}</span>
                  </motion.button>
                </div>
              </div>

              {/* STEP 2: Order Confirmed & Crafting Pipeline */}
              <div className="text-center py-6 space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-20 h-20 mx-auto rounded-full bg-botanical-sage/20 text-botanical-forest flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-botanical-sage" />
                </motion.div>

                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-botanical-sage font-semibold">
                    Payment Verified
                  </span>
                  <h3 className="font-serif text-3xl font-semibold text-botanical-forest mt-1">
                    Thank You, {formData.fullName.split(' ')[0]}!
                  </h3>
                  <p className="text-sm text-botanical-forest/70 font-sans mt-2 max-w-md mx-auto leading-relaxed">
                    Your order <strong>#{orderNumber}</strong> has been secured via PayMongo. Our master artisans have queued your bespoke pieces for hand-crafting.
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={closeCheckout}
                  className="py-3.5 px-8 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-botanical-md"
                >
                  Return to Collections
                </motion.button>
              </div>
            </TransitionPanel>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
