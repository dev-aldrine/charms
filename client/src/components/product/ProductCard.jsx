import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, ImageOff } from 'lucide-react';
import { formatPHP } from '../../utils/formatters';
import { useCartStore } from '../../store/useCartStore';
import { Spotlight } from '../core/Spotlight';

export const ProductCard = ({ product, onQuickCustomize, onSelectProduct, index = 0 }) => {
  const [selectedSize, setSelectedSize] = useState(product.availableSizes[1] || product.availableSizes[0]);
  const [isAdded, setIsAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);
  const [imgError, setImgError] = useState(false);

  const addItem = useCartStore(state => state.addItem);

  const handleImageError = () => {
    if (!imgError && product.fallbackImage) {
      setImgSrc(product.fallbackImage);
      setImgError(true);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      image: imgSrc,
      wristSize: selectedSize,
      gemstone: product.gemstone,
      material: product.material,
      collection: product.collection,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-3xl p-5 sm:p-5.5 border border-botanical-stone shadow-botanical-sm hover:shadow-botanical-lg transition-all duration-300 cursor-pointer"
    >
      <Spotlight className="w-full">
        {/* Product Image Frame: Crisp Balanced Square */}
        <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-botanical-clay/20 mb-4 flex items-center justify-center">
          <motion.img
            src={imgSrc}
            onError={handleImageError}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105"
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            loading="lazy"
          />

          {/* Collection Badge */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase text-botanical-forest border border-botanical-stone shadow-xs">
            {product.collection}
          </div>

          {/* Rating or Tag */}
          {product.tags && product.tags[0] && (
            <div className="absolute top-3 right-3 bg-botanical-forest/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[9px] tracking-wider uppercase font-sans shadow-xs">
              {product.tags[0]}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-botanical-sage font-bold">
                {product.gemstone}
              </span>
              <span className="font-serif text-lg sm:text-xl font-bold text-botanical-forest">
                {formatPHP(product.basePrice)}
              </span>
            </div>

            <h3 className="font-serif text-base sm:text-lg font-medium text-botanical-forest group-hover:text-botanical-terracotta transition-colors duration-300 leading-snug">
              {product.name}
            </h3>

            <p className="text-xs text-botanical-forest/70 font-sans mt-1.5 line-clamp-2 leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          {/* Wrist Size Selector & Actions */}
          <div className="mt-4 pt-3.5 border-t border-botanical-stone/60">
            <div className="flex items-center justify-between text-[11px] mb-2.5">
              <span className="text-botanical-forest/60 uppercase tracking-wider font-medium text-[10px]">
                Size (cm):
              </span>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {product.availableSizes.slice(0, 4).map((size) => (
                  <motion.button
                    key={size}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={`w-6 h-6 rounded-full text-[10px] font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'bg-botanical-forest text-white shadow-xs'
                        : 'bg-botanical-bg text-botanical-forest/70 hover:bg-botanical-stone'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className={`py-2.5 px-3 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  isAdded
                    ? 'bg-botanical-sage text-white'
                    : 'bg-botanical-forest hover:bg-botanical-terracotta text-white shadow-xs'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Added</span>
                  </>
                ) : (
                  <span>Add To Bag</span>
                )}
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                className="py-2.5 px-3 rounded-full text-[10px] font-semibold tracking-wider uppercase border border-botanical-stone hover:border-botanical-forest text-botanical-forest transition-colors duration-300 bg-white hover:bg-botanical-bg flex items-center justify-center gap-1"
              >
                <span>Details</span>
              </motion.button>
            </div>
          </div>
        </div>
      </Spotlight>
    </motion.div>
  );
};
