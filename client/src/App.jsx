import React, { useState } from 'react';
import { NoiseOverlay } from './components/common/NoiseOverlay';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CustomizerStudio } from './components/customizer/CustomizerStudio';
import { AtelierStory } from './pages/AtelierStory';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { WristSizeGuideModal } from './components/product/WristSizeGuideModal';
import { AuthModal } from './components/auth/AuthModal';
import { AccountDrawer } from './components/auth/AccountDrawer';
import { ProfilePage } from './pages/ProfilePage';

import { useAuthStore } from './store/useAuthStore';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { BRACELET_CATALOG } from './data/catalogData';

export function App() {
  const [currentTab, setCurrentTab] = useState('shop'); // 'shop', 'products', 'customizer', 'story', 'product', 'profile', 'admin'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customizerProduct, setCustomizerProduct] = useState(null);
  const { user, fetchProfile } = useAuthStore();

  // Parse path on initial load & popstate (Back/Forward buttons)
  const syncRouteFromUrl = () => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';

    if (path === '/admin' || path === '/admin/products') {
      setCurrentTab('admin');
    } else if (path === '/profile') {
      setCurrentTab('profile');
    } else if (path === '/products' || path === '/collection' || path === '/shop') {
      setCurrentTab('products');
    } else if (path === '/customizer') {
      setCurrentTab('customizer');
    } else if (path === '/story' || path === '/atelier') {
      setCurrentTab('story');
    } else if (path.startsWith('/product/')) {
      const slugOrId = path.replace('/product/', '');
      const matched = BRACELET_CATALOG.find(p => p.slug === slugOrId || p.id === slugOrId);
      if (matched) {
        setSelectedProduct(matched);
        setCurrentTab('product');
      } else {
        setCurrentTab('shop');
      }
    } else {
      setCurrentTab('shop');
    }
  };

  React.useEffect(() => {
    fetchProfile();
    syncRouteFromUrl();

    const handlePopState = () => syncRouteFromUrl();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (tab, customUrl = null) => {
    setCurrentTab(tab);
    let targetPath = '/';
    if (tab === 'admin') targetPath = '/admin';
    else if (tab === 'profile') targetPath = '/profile';
    else if (tab === 'products') targetPath = '/products';
    else if (tab === 'customizer') targetPath = '/customizer';
    else if (tab === 'story') targetPath = '/story';
    else if (tab === 'product' && selectedProduct) targetPath = `/product/${selectedProduct.slug || selectedProduct.id}`;
    
    if (customUrl) targetPath = customUrl;

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentTab('product');
    const targetPath = `/product/${product.slug || product.id}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCustomizer = (product = null) => {
    setCustomizerProduct(product);
    setCurrentTab('customizer');
    if (window.location.pathname !== '/customizer') {
      window.history.pushState({}, '', '/customizer');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-botanical-bg text-botanical-forest flex flex-col relative font-sans">
      {/* 1. Subtle Paper Grain Noise Overlay (Botanical Brand Identity) */}
      <NoiseOverlay />

      {/* 2. Main Navigation Bar */}
      <Navbar onNavigate={handleNavigate} currentTab={currentTab} />

      {/* 3. Page Router / Content Switching */}
      <main className="flex-1">
        {currentTab === 'shop' && (
          <HomePage 
            onNavigateToCustomizer={handleNavigateToCustomizer} 
            onSelectProduct={handleSelectProduct}
            onViewAllProducts={() => handleNavigate('products')}
          />
        )}
        {currentTab === 'products' && (
          <ProductsPage
            onSelectProduct={handleSelectProduct}
            onNavigateToCustomizer={handleNavigateToCustomizer}
            onBack={() => handleNavigate('shop')}
          />
        )}
        {currentTab === 'product' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => handleNavigate('products')}
            onSelectProduct={handleSelectProduct}
            onNavigateToCustomizer={handleNavigateToCustomizer}
          />
        )}
        {currentTab === 'customizer' && (
          <CustomizerStudio initialProduct={customizerProduct} />
        )}
        {currentTab === 'story' && (
          <AtelierStory onNavigateToCustomizer={handleNavigateToCustomizer} />
        )}
        {currentTab === 'profile' && (
          <ProfilePage 
            onBack={() => handleNavigate('shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}
        {currentTab === 'admin' && (
          <AdminProductsPage
            onBack={() => handleNavigate('shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </main>

      {/* 4. Global Drawers & Modals */}
      <CartDrawer />
      <CheckoutModal />
      <WristSizeGuideModal />
      <AuthModal />
      <AccountDrawer />

      {/* 5. Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
