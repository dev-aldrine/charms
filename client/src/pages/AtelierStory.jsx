import React from 'react';
import { Sparkles, Heart, ShieldCheck, RefreshCcw } from 'lucide-react';

export const AtelierStory = ({ onNavigateToCustomizer }) => {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 space-y-20">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-botanical-sage font-bold">
          Our Heritage &amp; Craft
        </span>
        <h1 className="font-serif text-4xl md:text-6xl font-medium text-botanical-forest">
          Honoring the Earth’s <span className="italic font-normal text-botanical-terracotta">Living Minerals</span>
        </h1>
        <p className="font-sans text-lg text-botanical-forest/70 max-w-2xl mx-auto leading-relaxed">
          Founded on the principle that jewelry should connect us deeper with the natural world and our daily intentions.
        </p>
      </div>

      {/* Grid of Ethos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-botanical-stone shadow-botanical-sm space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-botanical-bg flex items-center justify-center text-botanical-sage">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-botanical-forest">
            Grade A Certified Gems
          </h3>
          <p className="text-xs text-botanical-forest/70 leading-relaxed font-sans">
            Every bead is un-dyed, untreated, and ethically sourced from responsible artisanal mining co-ops worldwide.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-botanical-stone shadow-botanical-sm space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-botanical-bg flex items-center justify-center text-botanical-terracotta">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-botanical-forest">
            Custom Millimeter Fit
          </h3>
          <p className="text-xs text-botanical-forest/70 leading-relaxed font-sans">
            Standard jewelry fits poorly. We re-size, re-cord, and test tension individually for every client order.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-botanical-stone shadow-botanical-sm space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-botanical-bg flex items-center justify-center text-botanical-forest">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-botanical-forest">
            Lifetime Restring Guarantee
          </h3>
          <p className="text-xs text-botanical-forest/70 leading-relaxed font-sans">
            Our bond with your bracelet lasts forever. We offer complimentary re-stringing and bead refreshing services.
          </p>
        </div>
      </div>
    </div>
  );
};
