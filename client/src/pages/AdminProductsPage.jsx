import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Star, 
  DollarSign, 
  Tag, 
  Gem, 
  Sparkles, 
  ArrowLeft,
  Loader2,
  RefreshCw,
  Layers,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatPHP } from '../utils/formatters';

const COLLECTIONS = ['Beaded', 'Cuff', 'Chain', 'Couple'];

const EMPTY_PRODUCT_FORM = {
  name: '',
  slug: '',
  collection: 'Beaded',
  tagline: '',
  description: '',
  basePrice: '',
  stock: 50,
  gemstone: '',
  material: '',
  beadSize: '8mm',
  image: '',
  isFeatured: false,
  customizable: true,
  isActive: true,
  tags: '',
  availableSizes: '15, 16, 17, 18, 19, 20'
};

export const AdminProductsPage = ({ onBack, onSelectProduct }) => {
  const { user } = useAuthStore();
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProductStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive', 'featured'

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PRODUCT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Delete confirmation
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // White toast notification
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchProducts(true); // Fetch all products including inactive for admin
  }, []);

  const addToast = (title, message, isError = false) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, title, message, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Filtered & Searched Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      const matchSearch = !searchQuery || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.gemstone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id?.toLowerCase().includes(searchQuery.toLowerCase());

      // Collection
      const matchCollection = selectedCollection === 'All' || p.collection === selectedCollection;

      // Status
      let matchStatus = true;
      if (filterStatus === 'active') matchStatus = p.isActive !== false;
      if (filterStatus === 'inactive') matchStatus = p.isActive === false;
      if (filterStatus === 'featured') matchStatus = p.isFeatured === true;

      return matchSearch && matchCollection && matchStatus;
    });
  }, [products, searchQuery, selectedCollection, filterStatus]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setActiveProductId(null);
    setFormData(EMPTY_PRODUCT_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setIsEditing(true);
    setActiveProductId(product.id);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      collection: product.collection || 'Beaded',
      tagline: product.tagline || '',
      description: product.description || '',
      basePrice: product.basePrice || '',
      stock: product.stock !== undefined ? product.stock : 50,
      gemstone: product.gemstone || '',
      material: product.material || '',
      beadSize: product.beadSize || '8mm',
      image: product.image || '',
      isFeatured: product.isFeatured || false,
      customizable: product.customizable !== undefined ? product.customizable : true,
      isActive: product.isActive !== false,
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
      availableSizes: Array.isArray(product.availableSizes) ? product.availableSizes.join(', ') : '15, 16, 17, 18, 19, 20'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Upload Product Image (ImageKit / Cloudflare R2 / Server Upload)
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size exceeds 8MB limit.');
      return;
    }

    setUploadingImage(true);
    setUploadError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'products');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to upload image');
      }

      setFormData(prev => ({ ...prev, image: data.url }));
      addToast('Image Uploaded', 'Product image uploaded successfully.');
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.basePrice || Number(formData.basePrice) <= 0) errs.basePrice = 'Enter a valid price in PHP';
    if (!formData.image.trim()) errs.image = 'Product photo URL or upload is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSavingProduct(true);
    try {
      const parsedTags = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      
      const parsedSizes = formData.availableSizes
        ? formData.availableSizes.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0)
        : [15, 16, 17, 18, 19, 20];

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        collection: formData.collection,
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        basePrice: Number(formData.basePrice),
        stock: Number(formData.stock) || 0,
        gemstone: formData.gemstone.trim(),
        material: formData.material.trim(),
        beadSize: formData.beadSize.trim() || '8mm',
        image: formData.image.trim(),
        isFeatured: Boolean(formData.isFeatured),
        customizable: Boolean(formData.customizable),
        isActive: Boolean(formData.isActive),
        tags: parsedTags,
        availableSizes: parsedSizes
      };

      if (isEditing) {
        await updateProduct(activeProductId, payload);
        addToast('Product Updated', `"${payload.name}" has been updated.`);
      } else {
        await createProduct(payload);
        addToast('Product Created', `"${payload.name}" has been added to catalog.`);
      }

      setIsModalOpen(false);
    } catch (err) {
      addToast('Action Failed', err.message || 'Error saving product.', true);
    } finally {
      setSavingProduct(false);
    }
  };

  // Toggle Product Active Status
  const handleToggleActive = async (product) => {
    try {
      const updatedStatus = !(product.isActive !== false);
      await updateProduct(product.id, { isActive: updatedStatus });
      addToast(
        updatedStatus ? 'Product Activated' : 'Product Hidden',
        `"${product.name}" is now ${updatedStatus ? 'visible to customers' : 'hidden from public view'}.`
      );
    } catch (err) {
      addToast('Update Failed', err.message, true);
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (product) => {
    try {
      const updatedFeatured = !product.isFeatured;
      await updateProduct(product.id, { isFeatured: updatedFeatured });
      addToast(
        updatedFeatured ? 'Featured on Showcase' : 'Removed from Featured',
        `"${product.name}" ${updatedFeatured ? 'will show in hero spotlight' : 'is no longer highlighted'}.`
      );
    } catch (err) {
      addToast('Update Failed', err.message, true);
    }
  };

  // Delete product confirmed
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      addToast('Product Deleted', `"${productToDelete.name}" removed from inventory.`);
      setProductToDelete(null);
    } catch (err) {
      addToast('Delete Failed', err.message, true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-14 space-y-8">
      {/* Floating White Toasts */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
              className="pointer-events-auto flex items-start gap-3 bg-white text-botanical-forest p-4 rounded-2xl shadow-xl border border-botanical-stone/80 backdrop-blur-md"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                toast.isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {toast.isError ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-semibold text-botanical-forest font-serif">{toast.title}</p>
                <p className="text-[11px] text-botanical-forest/70 font-sans mt-0.5 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-botanical-forest/40 hover:text-botanical-forest transition-colors shrink-0 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-botanical-stone pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-botanical-stone bg-white flex items-center justify-center text-botanical-forest hover:bg-botanical-stone transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-botanical-sage font-bold">
                Atelier Administration
              </span>
              <span className="px-2 py-0.5 bg-botanical-forest text-white text-[9px] font-mono uppercase tracking-wider rounded-md font-bold">
                Admin Role
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-botanical-forest mt-0.5">
              Product &amp; Inventory Management
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts(true)}
            disabled={loading}
            className="p-2.5 rounded-2xl border border-botanical-stone bg-white hover:bg-botanical-stone text-botanical-forest transition-colors shadow-xs"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-botanical-terracotta' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="py-3 px-5 rounded-2xl bg-botanical-forest hover:bg-botanical-terracotta text-white font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-botanical-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-botanical-stone shadow-xs">
          <div className="flex items-center justify-between text-xs text-botanical-forest/60">
            <span>Total Catalog</span>
            <Package className="w-4 h-4 text-botanical-sage" />
          </div>
          <p className="font-serif text-2xl font-bold text-botanical-forest mt-2">{products.length}</p>
          <span className="text-[10px] text-botanical-sage">All created bracelets</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-botanical-stone shadow-xs">
          <div className="flex items-center justify-between text-xs text-botanical-forest/60">
            <span>Active in Store</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-700 mt-2">
            {products.filter(p => p.isActive !== false).length}
          </p>
          <span className="text-[10px] text-emerald-600">Available to purchase</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-botanical-stone shadow-xs">
          <div className="flex items-center justify-between text-xs text-botanical-forest/60">
            <span>Featured Highlights</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-800 mt-2">
            {products.filter(p => p.isFeatured).length}
          </p>
          <span className="text-[10px] text-amber-600">Spotlight creations</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-botanical-stone shadow-xs">
          <div className="flex items-center justify-between text-xs text-botanical-forest/60">
            <span>Hidden / Draft</span>
            <EyeOff className="w-4 h-4 text-botanical-forest/40" />
          </div>
          <p className="font-serif text-2xl font-bold text-botanical-forest/50 mt-2">
            {products.filter(p => p.isActive === false).length}
          </p>
          <span className="text-[10px] text-botanical-forest/40">Not visible to public</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-botanical-stone shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-botanical-forest/40" />
            <input
              type="text"
              placeholder="Search by name, gemstone, material, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-botanical-stone text-xs font-sans bg-botanical-bg/40 focus:outline-none focus:border-botanical-forest"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-botanical-forest/40 hover:text-botanical-forest"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Featured', value: 'featured' },
              { label: 'Hidden', value: 'inactive' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterStatus === tab.value
                    ? 'bg-botanical-forest text-white'
                    : 'bg-botanical-bg text-botanical-forest/70 hover:bg-botanical-stone'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Collection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-botanical-stone/40">
          <span className="text-[10px] uppercase font-bold tracking-wider text-botanical-forest/60 mr-1">
            Collection:
          </span>
          {['All', ...COLLECTIONS].map(coll => (
            <button
              key={coll}
              onClick={() => setSelectedCollection(coll)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedCollection === coll
                  ? 'bg-botanical-terracotta text-white font-semibold shadow-xs'
                  : 'bg-botanical-stone/50 hover:bg-botanical-stone text-botanical-forest/80'
              }`}
            >
              {coll}
            </button>
          ))}
          <span className="ml-auto text-xs text-botanical-forest/50 font-mono">
            Showing {filteredProducts.length} of {products.length}
          </span>
        </div>
      </div>

      {/* Products Table / Card Grid */}
      <div className="bg-white rounded-3xl border border-botanical-stone shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-botanical-bg/80 border-b border-botanical-stone text-[10px] uppercase tracking-wider text-botanical-forest/70 font-semibold">
                <th className="py-3.5 px-4 sm:px-6">Product</th>
                <th className="py-3.5 px-4">Collection</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Mineral / Material</th>
                <th className="py-3.5 px-4">Visibility</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-botanical-stone/60 text-xs font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-botanical-forest/60">
                    <Package className="w-8 h-8 mx-auto text-botanical-sage mb-2 opacity-60" />
                    <p className="font-serif text-base text-botanical-forest font-semibold">No products found</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search keywords.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr 
                    key={product.id}
                    className="hover:bg-botanical-bg/40 transition-colors group"
                  >
                    {/* Product Photo & Name */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-botanical-stone bg-botanical-bg shrink-0">
                          <img
                            src={product.image || product.fallbackImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/images/bracelet-jade.svg'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-semibold text-botanical-forest truncate hover:text-botanical-terracotta cursor-pointer"
                            onClick={() => onSelectProduct && onSelectProduct(product)}
                          >
                            {product.name}
                          </p>
                          <p className="text-[10px] text-botanical-forest/50 font-mono mt-0.5 truncate">
                            ID: {product.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Collection */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-botanical-stone/60 text-botanical-forest">
                        {product.collection}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono font-bold text-botanical-forest">
                      {formatPHP(product.basePrice)}
                    </td>

                    {/* Gemstone & Material */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-botanical-forest truncate max-w-xs">{product.gemstone || 'None'}</p>
                      <p className="text-[10px] text-botanical-forest/60 truncate max-w-xs">{product.material || 'Artisan'}</p>
                    </td>

                    {/* Active / Inactive Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                          product.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                        }`}
                        title={product.isActive !== false ? 'Click to hide from store' : 'Click to show in store'}
                      >
                        {product.isActive !== false ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-stone-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          product.isFeatured 
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50' 
                            : 'text-stone-300 hover:text-stone-500'
                        }`}
                        title={product.isFeatured ? 'Featured product (click to remove)' : 'Click to feature'}
                      >
                        <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    {/* Actions: Edit / Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 rounded-xl hover:bg-botanical-stone text-botanical-forest/70 hover:text-botanical-forest transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-2 rounded-xl hover:bg-red-50 text-botanical-forest/40 hover:text-red-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-botanical-forest/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-botanical-stone shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 w-8 h-8 rounded-full border border-botanical-stone flex items-center justify-center text-botanical-forest/60 hover:text-botanical-forest hover:bg-botanical-bg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-botanical-sage">
                  {isEditing ? 'Modify Atelier Piece' : 'New Creation'}
                </span>
                <h2 className="font-serif text-2xl font-bold text-botanical-forest">
                  {isEditing ? 'Edit Product Details' : 'Add New Bracelet to Catalog'}
                </h2>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-5">
                {/* 1. Name and Collection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Celestial Lapis Lazuli Link"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        formErrors.name ? 'border-red-400 bg-red-50/20' : 'border-botanical-stone'
                      } text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white`}
                    />
                    {formErrors.name && <p className="text-[10px] text-red-500">{formErrors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                      Collection
                    </label>
                    <select
                      value={formData.collection}
                      onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white"
                    >
                      {COLLECTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Price and Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                      Base Price (PHP ₱) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-botanical-forest/40">₱</span>
                      <input
                        type="number"
                        placeholder="2450"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${
                          formErrors.basePrice ? 'border-red-400 bg-red-50/20' : 'border-botanical-stone'
                        } text-xs font-mono font-bold focus:outline-none focus:border-botanical-forest bg-white`}
                      />
                    </div>
                    {formErrors.basePrice && <p className="text-[10px] text-red-500">{formErrors.basePrice}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                      Stock Inventory
                    </label>
                    <input
                      type="number"
                      placeholder="50"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                      Bead Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 8mm or 10mm"
                      value={formData.beadSize}
                      onChange={(e) => setFormData({ ...formData, beadSize: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white"
                    />
                  </div>
                </div>

                {/* 3. Gemstone & Material */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                      Gemstone / Mineral
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Grade A Burmese Jadeite"
                      value={formData.gemstone}
                      onChange={(e) => setFormData({ ...formData, gemstone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                      Material / Metal Accent
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14K Yellow Gold / 925 Silver"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white"
                    />
                  </div>
                </div>

                {/* 4. Tagline & Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                    Artisanal Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Soothing vibrational balance with hand-hammered accents"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                    Detailed Story &amp; Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the energy, origin, and crafting method of this piece..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white resize-none"
                  />
                </div>

                {/* 5. Image URL & Direct Device Upload */}
                <div className="space-y-2 p-4 bg-botanical-bg/60 rounded-2xl border border-botanical-stone">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                      Product Photography *
                    </label>
                    <label className="cursor-pointer text-[11px] font-semibold text-botanical-forest hover:text-botanical-terracotta flex items-center gap-1">
                      {uploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-botanical-sage" />
                      )}
                      <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="url"
                    placeholder="https://images.pexels.com/... or uploaded CDN URL"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      formErrors.image ? 'border-red-400 bg-red-50/20' : 'border-botanical-stone'
                    } text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white`}
                  />
                  {formErrors.image && <p className="text-[10px] text-red-500">{formErrors.image}</p>}
                  {uploadError && <p className="text-[10px] text-red-500">{uploadError}</p>}

                  {formData.image && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-botanical-stone shrink-0 bg-white">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] text-botanical-forest/60">Image live preview</span>
                    </div>
                  )}
                </div>

                {/* 6. Tags & Sizes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                      Badges / Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Bestseller, Artisanal Gem, Vermeil"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                      Available Wrist Sizes (cm)
                    </label>
                    <input
                      type="text"
                      placeholder="15, 16, 17, 18, 19, 20"
                      value={formData.availableSizes}
                      onChange={(e) => setFormData({ ...formData, availableSizes: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest bg-white"
                    />
                  </div>
                </div>

                {/* 7. Checkbox Toggles */}
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-botanical-stone/60">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-botanical-forest">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-botanical-stone text-botanical-forest focus:ring-botanical-forest w-4 h-4"
                    />
                    <span>Active in Store</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-botanical-forest">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded border-botanical-stone text-botanical-forest focus:ring-botanical-forest w-4 h-4"
                    />
                    <span>Featured Showcase</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-botanical-forest">
                    <input
                      type="checkbox"
                      checked={formData.customizable}
                      onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                      className="rounded border-botanical-stone text-botanical-forest focus:ring-botanical-forest w-4 h-4"
                    />
                    <span>Customizer Compatible</span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-botanical-stone">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-3 px-5 rounded-2xl border border-botanical-stone text-xs font-semibold uppercase tracking-wider hover:bg-botanical-bg transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="py-3 px-8 rounded-2xl bg-botanical-forest hover:bg-botanical-terracotta text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs"
                  >
                    {savingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-forest/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 border border-botanical-stone shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-xs">
                <Trash2 className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-botanical-forest">
                  Delete Product?
                </h3>
                <p className="text-xs text-botanical-forest/70 font-sans mt-1">
                  Are you sure you want to permanently delete <strong className="text-botanical-forest">"{productToDelete.name}"</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-botanical-stone text-xs font-semibold uppercase tracking-wider hover:bg-botanical-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Delete</span>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
