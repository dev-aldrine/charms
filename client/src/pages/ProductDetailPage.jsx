import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Check, ChevronLeft, ShieldCheck, Truck, RefreshCw, 
  Ruler, Star, Compass, Gem, Layers, ArrowRight, Share2 
} from 'lucide-react';
import { formatPHP } from '../utils/formatters';
import { useCartStore } from '../store/useCartStore';
import { BRACELET_CATALOG } from '../data/catalogData';
import { BRAND_CONFIG } from '../brandConfig';

export const ProductDetailPage = ({ product, onBack, onSelectProduct, onNavigateToCustomizer }) => {
  const [selectedSize, setSelectedSize] = useState(
    product.availableSizes ? (product.availableSizes[1] || product.availableSizes[0]) : 17
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'energy', 'care', 'shipping'
  const [copiedLink, setCopiedLink] = useState(false);

  const { addItem, openWristGuide } = useCartStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImage(product.image);
    setSelectedSize(product.availableSizes ? (product.availableSizes[1] || product.availableSizes[0]) : 17);
    setQuantity(1);
  }, [product]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.basePrice,
        image: product.image,
        wristSize: selectedSize,
        gemstone: product.gemstone,
        material: product.material,
        collection: product.collection,
      });
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Find related products in the same collection or fallback
  const relatedProducts = BRACELET_CATALOG
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
      {/* 1. Breadcrumb & Back Action Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-botanical-stone/60">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-botanical-forest/80 hover:text-botanical-terracotta transition-colors"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Collections</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-medium text-botanical-forest/60">
          <span className="hidden sm:inline">Collection: <strong className="text-botanical-forest">{product.collection}</strong></span>
          <button 
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-botanical-forest transition-colors px-3 py-1.5 rounded-full border border-botanical-stone/80 bg-white"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider">{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* Left Column: Visual Gallery (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-botanical-stone shadow-botanical-md group"
          >
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase text-botanical-forest border border-botanical-stone shadow-xs">
                {product.collection} Edition
              </span>
              {product.tags && product.tags[0] && (
                <span className="bg-botanical-forest/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] tracking-wider uppercase font-sans shadow-xs">
                  {product.tags[0]}
                </span>
              )}
            </div>

            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-botanical-forest text-[11px] px-3 py-1.5 rounded-full border border-botanical-stone font-mono flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-botanical-sage" />
              <span>Natural Mineral Verified</span>
            </div>
          </motion.div>

          {/* Feature Badges Under Image */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white border border-botanical-stone/80 text-center flex flex-col items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-botanical-sage mb-1" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-botanical-forest">Authentic</span>
              <span className="text-[10px] text-botanical-forest/60">Grade A Gem</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-botanical-stone/80 text-center flex flex-col items-center justify-center">
              <Truck className="w-4 h-4 text-botanical-sage mb-1" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-botanical-forest">Free Shipping</span>
              <span className="text-[10px] text-botanical-forest/60">Over ₱{BRAND_CONFIG.shippingThreshold.toLocaleString()}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-botanical-stone/80 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-4 h-4 text-botanical-sage mb-1" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-botanical-forest">Custom Fit</span>
              <span className="text-[10px] text-botanical-forest/60">Complimentary Resizing</span>
            </div>
          </div>
        </div>

        {/* Right Column: Details, Specifications, & Order Actions (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Title & Pricing */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-[0.25em] text-botanical-sage font-bold">
                {product.gemstone}
              </span>
              <span className="text-botanical-stone">•</span>
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span className="font-semibold text-botanical-forest">{product.rating || 4.9}</span>
                <span className="text-botanical-forest/50 font-normal">({product.reviewsCount || 42} reviews)</span>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-botanical-forest leading-tight">
              {product.name}
            </h1>

            {product.tagline && (
              <p className="font-serif italic text-base sm:text-lg text-botanical-terracotta mt-1.5 font-normal">
                "{product.tagline}"
              </p>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-botanical-forest">
                {formatPHP(product.basePrice)}
              </span>
              <span className="text-xs text-botanical-forest/60 font-sans">
                Tax & Custom Box Included
              </span>
            </div>
          </div>

          {/* Description Paragraph */}
          <p className="text-sm sm:text-base text-botanical-forest/80 font-sans leading-relaxed">
            {product.description}
          </p>

          {/* Key Attributes Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/70 border border-botanical-stone">
            <div className="flex items-center gap-2.5">
              <Gem className="w-4 h-4 text-botanical-sage shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-botanical-forest/60 block">Gemstone</span>
                <span className="text-xs font-semibold text-botanical-forest">{product.gemstone}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-botanical-sage shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-botanical-forest/60 block">Craft & Finish</span>
                <span className="text-xs font-semibold text-botanical-forest">{product.material}</span>
              </div>
            </div>
            {product.beadSize && (
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-botanical-sage shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-botanical-forest/60 block">Bead Diameter</span>
                  <span className="text-xs font-semibold text-botanical-forest">{product.beadSize}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Ruler className="w-4 h-4 text-botanical-sage shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-botanical-forest/60 block">Selected Fit</span>
                <span className="text-xs font-semibold text-botanical-forest">{selectedSize} cm (Wrist)</span>
              </div>
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest">
                Wrist Size (Circumference in CM)
              </label>
              <button
                onClick={openWristGuide}
                className="text-xs font-medium text-botanical-terracotta hover:underline flex items-center gap-1"
              >
                <Ruler className="w-3 h-3" />
                <span>Size Guide & Measuring Tips</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(product.availableSizes || [15, 16, 17, 18, 19, 20]).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    selectedSize === size
                      ? 'bg-botanical-forest text-white shadow-sm ring-2 ring-botanical-forest/20'
                      : 'bg-white border border-botanical-stone text-botanical-forest/80 hover:border-botanical-forest'
                  }`}
                >
                  {size} cm
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Primary Purchase Actions */}
          <div className="pt-2 space-y-3">
            <div className="flex gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center border border-botanical-stone rounded-full bg-white px-3 py-1.5">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-7 h-7 flex items-center justify-center text-sm font-semibold text-botanical-forest/70 hover:text-botanical-forest"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold font-mono text-botanical-forest">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-7 h-7 flex items-center justify-center text-sm font-semibold text-botanical-forest/70 hover:text-botanical-forest"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-botanical-md ${
                  isAdded
                    ? 'bg-botanical-sage text-white'
                    : 'bg-botanical-forest hover:bg-botanical-terracotta text-white'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added {quantity > 1 ? `(${quantity})` : ''} to Bag</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-botanical-sage" />
                    <span>Add To Bag • {formatPHP(product.basePrice * quantity)}</span>
                  </>
                )}
              </motion.button>
            </div>

          </div>

          {/* 3. Deep Dive Information Tabs */}
          <div className="pt-6 border-t border-botanical-stone/60">
            <div className="flex border-b border-botanical-stone/80 gap-6 text-xs font-semibold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'details'
                    ? 'border-botanical-forest text-botanical-forest'
                    : 'border-transparent text-botanical-forest/50 hover:text-botanical-forest'
                }`}
              >
                Details & Craft
              </button>
              <button
                onClick={() => setActiveTab('energy')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'energy'
                    ? 'border-botanical-forest text-botanical-forest'
                    : 'border-transparent text-botanical-forest/50 hover:text-botanical-forest'
                }`}
              >
                Metaphysical Energy
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'shipping'
                    ? 'border-botanical-forest text-botanical-forest'
                    : 'border-transparent text-botanical-forest/50 hover:text-botanical-forest'
                }`}
              >
                Shipping & QR Ph
              </button>
            </div>

            <div className="py-4 text-xs text-botanical-forest/80 font-sans leading-relaxed">
              {activeTab === 'details' && (
                <div className="space-y-2">
                  <p>
                    Every gemstone is hand-sorted by our master stringers to match high color consistency, luster, and structural purity. Strung on high-tensile multi-strand Japanese elastic or micro-braided jeweler cord for durability and effortless wear.
                  </p>
                  <p className="text-botanical-forest/60">
                    Includes branded embossed velvet pouch, gemstone card certificate, and extra sizing bead kit.
                  </p>
                </div>
              )}
              {activeTab === 'energy' && (
                <div className="space-y-2">
                  <p>
                    <strong className="text-botanical-forest">{product.gemstone}:</strong> Recharges tranquility and clears electromagnetic stagnation. Aligns with mindful breath and natural grounding intentions.
                  </p>
                  <p className="text-botanical-forest/60">
                    Best cleansed under the full moonlight or resting atop a raw selenite charging plate.
                  </p>
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="space-y-2">
                  <p>
                    Orders placed with <strong>QR Ph</strong> (GCash, Maya, ShopeePay, BDO, BPI, UnionBank) are instantly verified without manual screenshot upload.
                  </p>
                  <p className="text-botanical-forest/60">
                    Metro Manila delivery in 1–2 business days; Provincial nationwide in 2–4 business days via insured express couriers.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 4. Related Products Section */}
      <div className="mt-20 pt-12 border-t border-botanical-stone">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-botanical-sage font-bold">
              Harmonious Complements
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-botanical-forest mt-1">
              You May Also Cherish
            </h3>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold uppercase tracking-wider text-botanical-terracotta hover:underline hidden sm:block"
          >
            Explore Full Gallery →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((relProduct) => (
            <div
              key={relProduct.id}
              onClick={() => onSelectProduct(relProduct)}
              className="cursor-pointer group bg-white rounded-3xl p-4 border border-botanical-stone hover:shadow-botanical-lg transition-all duration-300"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-botanical-clay/20 mb-3">
                <img
                  src={relProduct.image}
                  alt={relProduct.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider text-botanical-forest">
                  {relProduct.collection}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-botanical-sage font-bold">
                  {relProduct.gemstone}
                </span>
                <h4 className="font-serif text-sm font-medium text-botanical-forest group-hover:text-botanical-terracotta transition-colors truncate">
                  {relProduct.name}
                </h4>
                <div className="font-serif text-sm font-bold text-botanical-forest pt-1">
                  {formatPHP(relProduct.basePrice)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
