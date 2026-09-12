import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Grid3X3, 
  Grid2X2, 
  Check, 
  X, 
  ArrowLeft,
  Filter,
  Gem,
  Tag
} from 'lucide-react';
import { BRACELET_CATALOG } from '../data/catalogData';
import { useProductStore } from '../store/useProductStore';
import { ProductCard } from '../components/product/ProductCard';
import { formatPHP } from '../utils/formatters';

const COLLECTIONS = ['All', 'Beaded', 'Cuff', 'Chain', 'Couple'];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₱2,000', min: 0, max: 2000 },
  { label: '₱2,000 - ₱3,500', min: 2000, max: 3500 },
  { label: 'Above ₱3,500', min: 3500, max: Infinity }
];

const SORT_OPTIONS = [
  { label: 'Curated & Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Alphabetical (A-Z)', value: 'name-asc' }
];

export const ProductsPage = ({ onSelectProduct, onNavigateToCustomizer, onBack }) => {
  const { products, fetchProducts } = useProductStore();
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [sortBy, setSortBy] = useState('featured');
  const [selectedGemstone, setSelectedGemstone] = useState('All');
  const [gridColumns, setGridColumns] = useState(4); // 4 or 3
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  React.useEffect(() => {
    fetchProducts(false); // Fetch active products
  }, []);

  const activeCatalog = useMemo(() => {
    return products && products.length > 0 ? products.filter(p => p.isActive !== false) : BRACELET_CATALOG;
  }, [products]);

  // Extract all unique gemstones from catalog
  const availableGemstones = useMemo(() => {
    const gemSet = new Set();
    activeCatalog.forEach(p => {
      if (p.gemstone) {
        // Split combined stones if applicable
        p.gemstone.split('&').forEach(g => gemSet.add(g.trim()));
      }
    });
    return ['All', ...Array.from(gemSet).sort()];
  }, [activeCatalog]);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return activeCatalog.filter(product => {
      // 1. Collection filter
      if (selectedCollection !== 'All' && product.collection !== selectedCollection) {
        return false;
      }

      // 2. Price filter
      if (product.basePrice < selectedPriceRange.min || product.basePrice > selectedPriceRange.max) {
        return false;
      }

      // 3. Gemstone filter
      if (selectedGemstone !== 'All' && !product.gemstone.toLowerCase().includes(selectedGemstone.toLowerCase())) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesTagline = product.tagline.toLowerCase().includes(q);
        const matchesGemstone = product.gemstone.toLowerCase().includes(q);
        const matchesMaterial = product.material.toLowerCase().includes(q);
        const matchesTags = product.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesTagline && !matchesGemstone && !matchesMaterial && !matchesTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      // 'featured' default: featured first, then rating
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [selectedCollection, selectedPriceRange, selectedGemstone, searchQuery, sortBy]);

  const activeFilterCount = (selectedCollection !== 'All' ? 1 : 0) + 
    (selectedPriceRange.label !== 'All Prices' ? 1 : 0) + 
    (selectedGemstone !== 'All' ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCollection('All');
    setSelectedPriceRange(PRICE_RANGES[0]);
    setSelectedGemstone('All');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="w-full px-6 sm:px-10 md:px-16 lg:px-20 py-10 md:py-16 space-y-10">
      {/* 1. Header & Breadcrumb / Back Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-botanical-stone/80 pb-8">
        <div className="space-y-3">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-botanical-forest/60 hover:text-botanical-forest transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sanctuary</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-botanical-sage font-bold">
              Complete Atelier Catalog
            </span>
            <span className="text-xs font-mono text-botanical-forest/40">/</span>
            <span className="text-xs font-mono text-botanical-forest/60">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-botanical-forest">
            All Handcrafted <span className="italic font-normal text-botanical-terracotta">Creations</span>
          </h1>
          <p className="text-sm font-sans text-botanical-clay max-w-xl leading-relaxed">
            Every bracelet in our compendium is individually strung with natural earth minerals, cleansed with botanical sage, and calibrated to your exact wrist millimeter.
          </p>
        </div>

        {/* Customizer CTA Banner on Catalog */}
        <div className="bg-white/80 border border-botanical-stone p-5 rounded-3xl shadow-botanical-sm flex items-center justify-between gap-4 max-w-md">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-botanical-sage block">
              Bespoke Service
            </span>
            <p className="text-xs font-serif font-semibold text-botanical-forest mt-0.5">
              Want to craft a 1-of-1 personalized talisman?
            </p>
          </div>
          <button
            onClick={() => onNavigateToCustomizer?.()}
            className="py-2.5 px-4 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-botanical-sage" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Controls Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-botanical-forest/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by gemstone, material, style (e.g. Jade, Gold, Rose Quartz)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-full border border-botanical-stone bg-white/90 text-xs font-sans text-botanical-forest placeholder:text-botanical-forest/40 focus:outline-none focus:border-botanical-forest focus:ring-1 focus:ring-botanical-forest transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-botanical-forest/40 hover:text-botanical-forest"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Filter Actions & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className={`lg:hidden py-3 px-5 rounded-full border text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                activeFilterCount > 0
                  ? 'bg-botanical-forest text-white border-botanical-forest'
                  : 'bg-white border-botanical-stone text-botanical-forest'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            {/* Sort Selector */}
            <div className="relative flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-botanical-stone">
              <ArrowUpDown className="w-3.5 h-3.5 text-botanical-forest/50" />
              <span className="text-[11px] uppercase tracking-wider text-botanical-forest/60 font-semibold hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-botanical-forest focus:outline-none cursor-pointer pr-2"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid Density Toggle (Desktop) */}
            <div className="hidden sm:flex items-center gap-1 bg-white border border-botanical-stone rounded-full p-1">
              <button
                onClick={() => setGridColumns(3)}
                className={`p-1.5 rounded-full transition-colors ${
                  gridColumns === 3 ? 'bg-botanical-forest text-white' : 'text-botanical-forest/60 hover:text-botanical-forest'
                }`}
                title="3 Columns"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridColumns(4)}
                className={`p-1.5 rounded-full transition-colors ${
                  gridColumns === 4 ? 'bg-botanical-forest text-white' : 'text-botanical-forest/60 hover:text-botanical-forest'
                }`}
                title="4 Columns"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Filter Pills Bar (Collections, Price Ranges, Gemstones) */}
        <div className="hidden lg:flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-botanical-stone/40">
          {/* Collection Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-botanical-forest/50 mr-1">
              Style:
            </span>
            {COLLECTIONS.map(col => (
              <button
                key={col}
                onClick={() => setSelectedCollection(col)}
                className={`py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCollection === col
                    ? 'bg-botanical-forest text-white shadow-botanical-sm'
                    : 'bg-white/80 border border-botanical-stone text-botanical-forest hover:border-botanical-forest/60'
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          {/* Price Range Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-botanical-forest/50 mr-1">
              Price:
            </span>
            {PRICE_RANGES.map(range => (
              <button
                key={range.label}
                onClick={() => setSelectedPriceRange(range)}
                className={`py-1.5 px-3.5 rounded-full text-xs font-medium transition-all ${
                  selectedPriceRange.label === range.label
                    ? 'bg-botanical-terracotta text-white font-semibold shadow-xs'
                    : 'bg-white/80 border border-botanical-stone text-botanical-forest hover:border-botanical-forest/60'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Clear Filter Button if any active */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold underline underline-offset-4 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Mobile Filter Drawer / Collapse */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white rounded-3xl p-6 border border-botanical-stone shadow-botanical-md space-y-5 overflow-hidden"
            >
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-botanical-forest block mb-2">
                  Collection Style
                </span>
                <div className="flex flex-wrap gap-2">
                  {COLLECTIONS.map(col => (
                    <button
                      key={col}
                      onClick={() => setSelectedCollection(col)}
                      className={`py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        selectedCollection === col
                          ? 'bg-botanical-forest text-white'
                          : 'bg-botanical-bg border border-botanical-stone text-botanical-forest'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-botanical-forest block mb-2">
                  Price Filter
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map(range => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(range)}
                      className={`py-1.5 px-3.5 rounded-full text-xs ${
                        selectedPriceRange.label === range.label
                          ? 'bg-botanical-terracotta text-white font-semibold'
                          : 'bg-botanical-bg border border-botanical-stone text-botanical-forest'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="pt-2 flex justify-between items-center border-t border-botanical-stone">
                  <span className="text-xs text-botanical-forest/60">
                    {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
                  </span>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-red-600 font-semibold underline"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Product Gallery Grid */}
      {filteredProducts.length > 0 ? (
        <motion.div
          layout
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            gridColumns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
          } gap-6 md:gap-8`}
        >
          <AnimatePresence>
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onSelectProduct={onSelectProduct}
                onQuickCustomize={() => onNavigateToCustomizer?.(product)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-4xl p-12 sm:p-16 border border-botanical-stone text-center max-w-xl mx-auto space-y-4 my-8 shadow-botanical-sm">
          <div className="w-16 h-16 rounded-full bg-botanical-bg flex items-center justify-center mx-auto text-botanical-sage">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-semibold text-botanical-forest">
            No Talismans Matched Your Search
          </h3>
          <p className="text-xs font-sans text-botanical-clay leading-relaxed">
            We couldn't find any creations matching "{searchQuery || selectedCollection}". Try adjusting your gemstone or price filter, or craft a bespoke 1-of-1 design in our Studio.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={clearAllFilters}
              className="py-3 px-6 rounded-full border border-botanical-stone text-xs font-semibold uppercase tracking-wider hover:bg-botanical-bg transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={() => onNavigateToCustomizer?.()}
              className="py-3 px-6 rounded-full bg-botanical-forest text-white text-xs font-semibold uppercase tracking-wider hover:bg-botanical-terracotta transition-colors shadow-xs"
            >
              Design Custom Piece
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
