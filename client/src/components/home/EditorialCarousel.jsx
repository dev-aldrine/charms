import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { formatPHP } from '../../utils/formatters';

const EDITORIAL_SLIDES = [
  {
    id: 'slide_1',
    subtitle: 'High Jewelry Capsule 01',
    title: 'Imperial Burmese Jadeite & 14K Rondelles',
    quote: 'Imbued with tranquil balance and timeless heritage.',
    image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stone: 'Natural Grade A Jadeite',
    origin: 'Kachin State, Myanmar',
    price: 2450,
    badge: 'Artisanal Selection'
  },
  {
    id: 'slide_2',
    subtitle: 'High Jewelry Capsule 02',
    title: 'Sculpted Vermeil Rose Quartz & Baroque Pearl',
    quote: 'Open sculpted silhouette holding raw translucent crystals.',
    image: 'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stone: 'Madagascar Rose Quartz',
    origin: 'Antsirabe, Madagascar',
    price: 3200,
    badge: 'Limited Atelier Run'
  },
  {
    id: 'slide_3',
    subtitle: 'High Jewelry Capsule 03',
    title: 'Volcanic Obsidian & Matte Onyx Talisman',
    quote: 'Forged in geothermal fire, strung for grounding and focus.',
    image: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stone: 'Black Obsidian & Mineral Lava',
    origin: 'Puebla, Mexico',
    price: 1850,
    badge: 'Unisex Signature'
  }
];

export const EditorialCarousel = ({ onNavigateToCustomizer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Auto slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % EDITORIAL_SLIDES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + EDITORIAL_SLIDES.length) % EDITORIAL_SLIDES.length);
  };

  const currentSlide = EDITORIAL_SLIDES[currentIndex];

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 30 },
        opacity: { duration: 0.5 },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.4 },
    }),
  };

  return (
    <section className="relative max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
      <div className="bg-botanical-forest text-botanical-bg rounded-4xl p-6 sm:p-10 md:p-16 relative overflow-hidden shadow-botanical-xl border border-botanical-stone/20">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-botanical-sage/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-botanical-terracotta/15 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 border-b border-botanical-stone/20 pb-6 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-botanical-sage font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-botanical-sage animate-pulse" />
              <span>Haute Joaillerie &bull; Editorial Spotlight</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-white mt-1">
              Curated Atelier <span className="italic font-normal text-botanical-sage">Masterpieces</span>
            </h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-botanical-clay font-mono">
              0{currentIndex + 1} / 0{EDITORIAL_SLIDES.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous editorial slide"
                className="w-10 h-10 rounded-full border border-botanical-stone/30 flex items-center justify-center hover:bg-white hover:text-botanical-forest transition-colors text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next editorial slide"
                className="w-10 h-10 rounded-full border border-botanical-stone/30 flex items-center justify-center hover:bg-white hover:text-botanical-forest transition-colors text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Animated Carousel Slide Content */}
        <div className="relative min-h-[460px] md:min-h-[420px] flex items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center"
            >
              {/* Left Details */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-block px-3.5 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold bg-botanical-sage/20 text-botanical-sage border border-botanical-sage/30">
                  {currentSlide.badge}
                </div>

                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-botanical-clay/80 block">
                    {currentSlide.subtitle}
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight">
                    {currentSlide.title}
                  </h3>
                </div>

                <p className="font-serif italic text-base md:text-lg text-botanical-clay leading-relaxed">
                  "{currentSlide.quote}"
                </p>

                {/* Mineral Origin Meta */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-botanical-stone/20 text-xs font-sans">
                  <div>
                    <span className="text-botanical-clay/60 uppercase tracking-wider block text-[10px]">Primary Mineral</span>
                    <strong className="text-white font-medium">{currentSlide.stone}</strong>
                  </div>
                  <div>
                    <span className="text-botanical-clay/60 uppercase tracking-wider block text-[10px]">Ethical Provenance</span>
                    <strong className="text-white font-medium">{currentSlide.origin}</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onNavigateToCustomizer}
                    className="py-3.5 px-7 rounded-full bg-botanical-sage hover:bg-botanical-terracotta text-botanical-forest hover:text-white font-semibold text-xs uppercase tracking-widest transition-colors duration-300 flex items-center gap-2"
                  >
                    <span>Customize In Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                  <span className="font-serif text-xl font-bold text-white">
                    {formatPHP(currentSlide.price)}
                  </span>
                </div>
              </div>

              {/* Right Luxury Square Image Showcase */}
              <div className="lg:col-span-6 relative flex justify-center">
                <div className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-botanical-forest">
                  <motion.img
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-botanical-forest/60 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Slide Indicator Dots */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {EDITORIAL_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-8 bg-botanical-sage' : 'w-2 bg-botanical-stone/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
