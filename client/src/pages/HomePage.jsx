import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BRACELET_CATALOG } from '../data/catalogData';
import { BRAND_CONFIG } from '../brandConfig';
import { ProductCard } from '../components/product/ProductCard';
import { TextEffect } from '../components/core/TextEffect';
import { InView } from '../components/core/InView';
import { FullWidthHeroCarousel } from '../components/home/FullWidthHeroCarousel';
import { MineralCompendium } from '../components/home/MineralCompendium';
import { ReviewsAndEthos } from '../components/home/ReviewsAndEthos';
import { Sparkles, Leaf } from 'lucide-react';

export const HomePage = ({ onNavigateToCustomizer }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(8); // 2 rows at 4 columns = 8 items

  const handleFilterChange = (category) => {
    setActiveFilter(category);
    setVisibleCount(8);
  };

  const filteredProducts = activeFilter === 'All'
    ? BRACELET_CATALOG
    : BRACELET_CATALOG.filter(p => p.collection === activeFilter);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, filteredProducts.length)); // Load next 2 rows (8 items)
  };

  return (
    <div className="space-y-12 md:space-y-16 pb-16">
      {/* 1. CINEMATIC FULL-WIDTH HERO IMAGE CAROUSEL */}
      <FullWidthHeroCarousel onNavigateToCustomizer={onNavigateToCustomizer} />

      {/* 2. CURATED CATALOG SECTION (100% Full Width Expansive Gallery) */}
      <section id="catalog" className="w-full px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-botanical-sage font-bold">
              Bespoke Catalog
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-botanical-forest mt-1">
              Curated <span className="italic font-normal text-botanical-terracotta">Fine</span> Collections
            </h2>
          </div>

          {/* Collection Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Beaded', 'Cuff', 'Chain', 'Couple'].map((category) => (
              <motion.button
                key={category}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange(category)}
                className={`py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeFilter === category
                    ? 'bg-botanical-forest text-white shadow-botanical-sm'
                    : 'bg-white border border-botanical-stone text-botanical-forest hover:border-botanical-sage'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Responsive Multi-Column Gallery (4 columns on desktop, exactly 2 rows = 8 items) */}
        <InView
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.08, duration: 0.5 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {displayedProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
              onQuickCustomize={() => onNavigateToCustomizer()}
            />
          ))}
        </InView>

        {/* See More Products Action Bar */}
        {hasMore && (
          <div className="flex flex-col items-center justify-center mt-12 space-y-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLoadMore}
              className="py-4 px-10 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-botanical-md flex items-center gap-2 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-botanical-sage group-hover:rotate-12 transition-transform" />
              <span>See More Creations ({filteredProducts.length - visibleCount} Remaining)</span>
            </motion.button>
            <span className="text-[11px] text-botanical-forest/60 uppercase tracking-widest font-mono">
              Showing {displayedProducts.length} of {filteredProducts.length} Atelier Pieces
            </span>
          </div>
        )}
      </section>

      {/* 3. EDITORIAL ATELIER STATS BAR (Placed After Gallery) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-botanical-lg border border-botanical-stone/80 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 items-center text-center sm:text-left">
          <div className="sm:border-r border-botanical-stone/60 sm:pr-6">
            <div className="font-serif text-3xl font-semibold text-botanical-forest">100%</div>
            <div className="text-xs uppercase tracking-wider text-botanical-forest/60 font-sans mt-0.5">Ethical Mined Minerals</div>
          </div>

          <div className="sm:border-r border-botanical-stone/60 sm:pr-6">
            <div className="font-serif text-3xl font-semibold text-botanical-forest">0.5 cm</div>
            <div className="text-xs uppercase tracking-wider text-botanical-forest/60 font-sans mt-0.5">Precision Millimeter Fit</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-start">
            <div className="h-9 w-24 overflow-hidden flex items-center rounded-lg bg-botanical-bg p-1 border border-botanical-stone">
              <img
                src={BRAND_CONFIG.logos.qrPh}
                alt="QR Ph Logo"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <strong className="text-xs uppercase tracking-wider text-botanical-forest block font-semibold">National QR Ph</strong>
              <span className="text-[11px] text-botanical-forest/60 block">Instant Bank &amp; Wallet Scan</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MINERALOGICAL ENCYCLOPEDIA & METAPHYSICAL LORE */}
      <MineralCompendium />

      {/* 5. VERIFIED COLLECTOR REVIEWS & ATELIER PROMISES */}
      <ReviewsAndEthos />

      {/* 3. ATELIER ETHOS BANNER WITH INVIEW */}
      <InView className="bg-botanical-forest text-botanical-bg py-20 rounded-4xl mx-6 md:mx-12 px-8 md:px-16 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="text-xs uppercase tracking-[0.3em] text-botanical-sage font-bold">
            The Philosophy of Touch
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-medium leading-snug">
            Designed for mindful presence, crafted for timeless beauty.
          </h2>
          <p className="font-sans text-botanical-clay text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            We reject mass manufacturing. Every bracelet is individually strung, cleansed with botanical sage smoke, and tailored to the wearer’s wrist millimeter.
          </p>
          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigateToCustomizer()}
              className="py-4 px-8 rounded-full bg-botanical-sage hover:bg-botanical-terracotta text-botanical-forest hover:text-white font-semibold text-xs uppercase tracking-widest transition-colors duration-300"
            >
              Design Your Talisman
            </motion.button>
          </div>
        </div>
      </InView>
    </div>
  );
};
