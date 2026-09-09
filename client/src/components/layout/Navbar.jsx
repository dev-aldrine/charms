import React, { useState } from 'react';
import { ShoppingBag, Ruler, Sparkles, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { BRAND_CONFIG } from '../../brandConfig';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = ({ onNavigate, currentTab }) => {
  const { items, openCart, openWristGuide } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavClick = (tab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-botanical-bg/95 backdrop-blur-md border-b border-botanical-stone/70 transition-all duration-300">
      {/* Editorial Announcement Bar */}
      <div className="bg-botanical-forest text-botanical-bg text-xs py-2 px-4 tracking-widest uppercase text-center font-sans font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-botanical-sage animate-pulse" />
        <span className="truncate">{BRAND_CONFIG.announcement}</span>
        <Sparkles className="w-3.5 h-3.5 text-botanical-sage animate-pulse" />
      </div>

      {/* Balanced 3-Column True Centered Navigation Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-3.5 grid grid-cols-3 items-center">
        
        {/* Left Column: Desktop Navigation Links / Mobile Menu Toggle */}
        <div className="flex items-center justify-start">
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs uppercase tracking-widest font-medium text-botanical-forest/80">
            <button
              onClick={() => handleNavClick('shop')}
              className={`transition-colors duration-300 hover:text-botanical-terracotta ${
                currentTab === 'shop' ? 'text-botanical-forest font-semibold border-b border-botanical-forest pb-0.5' : ''
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => handleNavClick('customizer')}
              className={`flex items-center gap-1.5 transition-colors duration-300 hover:text-botanical-terracotta ${
                currentTab === 'customizer' ? 'text-botanical-forest font-semibold border-b border-botanical-forest pb-0.5' : ''
              }`}
            >
              <Sparkles className="w-3 h-3 text-botanical-sage" />
              <span>Custom Studio</span>
            </button>
            <button
              onClick={() => handleNavClick('story')}
              className={`transition-colors duration-300 hover:text-botanical-terracotta ${
                currentTab === 'story' ? 'text-botanical-forest font-semibold border-b border-botanical-forest pb-0.5' : ''
              }`}
            >
              Our Atelier
            </button>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full border border-botanical-stone flex items-center justify-center text-botanical-forest hover:bg-botanical-stone transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Center Column: Perfectly Centered Brand Logo */}
        <div className="flex flex-col items-center justify-center text-center cursor-pointer select-none" onClick={() => handleNavClick('shop')}>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-botanical-forest whitespace-nowrap">
            {BRAND_CONFIG.brandName} <span className="font-normal italic text-botanical-sage">{BRAND_CONFIG.brandSubtitle}</span>
          </h1>
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-botanical-forest/60 -mt-0.5 whitespace-nowrap">
            {BRAND_CONFIG.tagline}
          </p>
        </div>

        {/* Right Column: Actions (Size Tool & Cart Bag) */}
        <div className="flex items-center justify-end gap-3 md:gap-4">
          <button
            onClick={openWristGuide}
            className="hidden sm:flex items-center gap-1.5 text-[11px] uppercase tracking-wider py-2 px-3.5 rounded-full border border-botanical-stone hover:border-botanical-sage text-botanical-forest transition-all duration-300 bg-white/70 hover:bg-white shadow-sm"
            title="Wrist Sizing Calculator"
          >
            <Ruler className="w-3.5 h-3.5 text-botanical-sage" />
            <span>Size Guide</span>
          </button>

          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-botanical-forest text-white hover:bg-botanical-terracotta transition-colors duration-300 shadow-botanical-sm"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-botanical-terracotta text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-botanical-bg">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-botanical-bg border-b border-botanical-stone px-6 py-6 space-y-4"
          >
            <nav className="flex flex-col space-y-3 text-xs uppercase tracking-widest font-semibold text-botanical-forest">
              <button
                onClick={() => handleNavClick('shop')}
                className="text-left py-2 border-b border-botanical-stone/40"
              >
                Collections
              </button>
              <button
                onClick={() => handleNavClick('customizer')}
                className="text-left py-2 border-b border-botanical-stone/40 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-botanical-sage" />
                <span>Custom Studio</span>
              </button>
              <button
                onClick={() => handleNavClick('story')}
                className="text-left py-2 border-b border-botanical-stone/40"
              >
                Our Atelier
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openWristGuide();
                }}
                className="text-left py-2 flex items-center gap-2 text-botanical-sage"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Interactive Size Guide</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
