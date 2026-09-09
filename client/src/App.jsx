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

export function App() {
  const [currentTab, setCurrentTab] = useState('shop'); // 'shop', 'customizer', 'story'

  return (
    <div className="min-h-screen bg-botanical-bg text-botanical-forest flex flex-col relative font-sans">
      {/* 1. Subtle Paper Grain Noise Overlay (Botanical Brand Identity) */}
      <NoiseOverlay />

      {/* 2. Main Navigation Bar */}
      <Navbar onNavigate={setCurrentTab} currentTab={currentTab} />

      {/* 3. Page Router / Content Switching */}
      <main className="flex-1">
        {currentTab === 'shop' && (
          <HomePage onNavigateToCustomizer={() => setCurrentTab('customizer')} />
        )}
        {currentTab === 'customizer' && (
          <CustomizerStudio />
        )}
        {currentTab === 'story' && (
          <AtelierStory onNavigateToCustomizer={() => setCurrentTab('customizer')} />
        )}
      </main>

      {/* 4. Global Drawers & Modals */}
      <CartDrawer />
      <CheckoutModal />
      <WristSizeGuideModal />

      {/* 5. Footer */}
      <Footer onNavigate={setCurrentTab} />
    </div>
  );
}

export default App;
