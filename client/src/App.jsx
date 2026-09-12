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

import { ProductDetailPage } from './pages/ProductDetailPage';

export function App() {
  const [currentTab, setCurrentTab] = useState('shop'); // 'shop', 'customizer', 'story', 'product', 'profile'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customizerProduct, setCustomizerProduct] = useState(null);

  const handleNavigate = (tab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentTab('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCustomizer = (product = null) => {
    setCustomizerProduct(product);
    setCurrentTab('customizer');
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
          />
        )}
        {currentTab === 'product' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => handleNavigate('shop')}
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
