import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 'hero_1',
    image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1920',
    collection: 'High Jewelry • Capsule 01',
    headline: 'Sacred Minerals, Timeless Craft',
    description: 'Rare Grade A Burmese Jadeite hand-strung with pure 14K solid gold accents.',
    actionText: 'Explore Jade Collection'
  },
  {
    id: 'hero_2',
    image: 'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=1920',
    collection: 'Haute Joaillerie • Limited Edition',
    headline: 'Sculpted Vermeil & Rose Crystals',
    description: 'Organic raw crystals crowned in 925 sterling silver dipped in French vermeil.',
    actionText: 'Discover Rose Quartz'
  },
  {
    id: 'hero_3',
    image: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=1920',
    collection: 'Earth Elements • Handcrafted Talismans',
    headline: 'Forged in Geothermal Stillness',
    description: 'Volcanic matte black obsidian and mineral lava for grounding energy.',
    actionText: 'View Obsidian Pieces'
  },
  {
    id: 'hero_4',
    image: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=1920',
    collection: 'Celestial Series • 18K Chainwork',
    headline: 'Sunstone & Baltic Amber Drops',
    description: 'Hand-linked golden sunstones that shimmer with ethereal natural light.',
    actionText: 'Experience Sunstone'
  }
];

export const FullWidthHeroCarousel = ({ onNavigateToCustomizer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <div className="relative w-full h-[85vh] min-h-[580px] max-h-[820px] overflow-hidden bg-botanical-forest">
      {/* Background Image Carousel with Eased Crossfade & Subtle Zoom */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={currentSlide.image}
            alt={currentSlide.headline}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle Clean Neutral Gradient Overlays (Preserves Photo Clarity) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* Foreground Hero Editorial Content */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-between py-12 md:py-16">
        
        {/* Top Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.3em] text-white self-start"
        >
          <Sparkles className="w-3.5 h-3.5 text-botanical-sage animate-pulse" />
          <span>Joy’s Atelier &bull; Haute Joaillerie</span>
        </motion.div>

        {/* Center / Lower-Left Animated Headline & Details */}
        <div className="max-w-2xl space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="space-y-4"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-botanical-sage font-bold block">
                {currentSlide.collection}
              </span>

              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-white leading-[1.05]">
                {currentSlide.headline}
              </h1>

              <p className="font-sans text-base sm:text-lg text-white/80 max-w-xl leading-relaxed font-light">
                {currentSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#catalog"
              className="py-4 px-8 rounded-full bg-botanical-sage hover:bg-botanical-terracotta text-botanical-forest hover:text-white font-semibold text-xs uppercase tracking-widest transition-colors duration-300 shadow-2xl flex items-center gap-2 group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 text-botanical-forest group-hover:text-white transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Bottom Bar: Slide Counter, Indicators & Arrow Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-white/15">
          {/* Slide Progress Lines */}
          <div className="flex items-center gap-3">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  currentIndex === idx ? 'w-12 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Counter & Arrows */}
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-widest text-white/70 font-mono">
              0{currentIndex + 1} &mdash; 0{HERO_SLIDES.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="w-11 h-11 rounded-full border border-white/30 bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-botanical-forest text-white transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Slide"
                className="w-11 h-11 rounded-full border border-white/30 bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-botanical-forest text-white transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
