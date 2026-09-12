import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-botanical-forest text-botanical-bg border-t border-botanical-stone/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-4">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
            JOY’S <span className="font-normal italic text-botanical-sage">ATELIER</span>
          </h2>
          <p className="text-xs text-botanical-clay leading-relaxed max-w-sm font-sans">
            Artisanal gemstone and fine metal bracelets crafted with botanical intentionality. Based in Manila, shipping nationwide via PayMongo QR Ph.
          </p>
          <div className="text-[11px] text-botanical-clay/70">
            © {new Date().getFullYear()} Joy’s Atelier. All rights reserved.
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">
            Explore Atelier
          </h4>
          <ul className="space-y-2 text-xs text-botanical-clay font-sans">
            <li>
              <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                Curated Collections
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('customizer')} className="hover:text-white transition-colors">
                Custom Gemstone Studio
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('story')} className="hover:text-white transition-colors">
                Artisanal Ethos
              </button>
            </li>
          </ul>
        </div>

        {/* Philippine QR Ph & Payment Security */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">
            Seamless Local Payments
          </h4>
          <p className="text-xs text-botanical-clay font-sans leading-relaxed">
            Secured by PayMongo and Bangko Sentral ng Pilipinas (BSP) National QR Ph standard.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-botanical-sage font-medium uppercase tracking-widest pt-2">
            <span>GCash</span>
            <span>•</span>
            <span>Maya</span>
            <span>•</span>
            <span>BDO / BPI</span>
            <span>•</span>
            <span>QR Ph</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
