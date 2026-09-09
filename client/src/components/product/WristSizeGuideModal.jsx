import React, { useState } from 'react';
import { X, Ruler, Sparkles, Check, Info } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { getWristCategory } from '../../utils/formatters';

export const WristSizeGuideModal = () => {
  const { isWristGuideOpen, closeWristGuide } = useCartStore();
  const [measuredCm, setMeasuredCm] = useState(16.5);
  const [fitPreference, setFitPreference] = useState('snug'); // 'snug', 'comfort', 'loose'

  if (!isWristGuideOpen) return null;

  const calculateRecommendedSize = () => {
    let added = 0.5; // default snug
    if (fitPreference === 'comfort') added = 1.5;
    if (fitPreference === 'loose') added = 2.5;

    const total = measuredCm + added;
    if (total <= 15) return 15;
    if (total <= 16.5) return 16;
    if (total <= 17.5) return 17;
    if (total <= 18.5) return 18;
    if (total <= 19.5) return 19;
    return 20;
  };

  const recommendedSize = calculateRecommendedSize();
  const category = getWristCategory(measuredCm);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        onClick={closeWristGuide} 
        className="fixed inset-0 bg-botanical-forest/60 backdrop-blur-md transition-opacity" 
      />

      <div className="relative bg-white w-full max-w-2xl rounded-4xl border border-botanical-stone shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="p-6 md:p-8 bg-botanical-bg border-b border-botanical-stone flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-botanical-sage/20 flex items-center justify-center text-botanical-forest">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-botanical-sage font-bold">
                Artisanal Sizing Tool
              </span>
              <h3 className="font-serif text-2xl font-semibold text-botanical-forest">
                Wrist Sizing &amp; Fit Calculator
              </h3>
            </div>
          </div>
          <button
            onClick={closeWristGuide}
            className="w-9 h-9 rounded-full bg-white border border-botanical-stone flex items-center justify-center hover:bg-botanical-stone transition-colors"
          >
            <X className="w-4 h-4 text-botanical-forest" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Quick instructions */}
          <div className="bg-botanical-bg rounded-2xl p-4 border border-botanical-stone text-xs text-botanical-forest/80 space-y-2">
            <div className="font-semibold text-botanical-forest flex items-center gap-1.5">
              <Info className="w-4 h-4 text-botanical-sage" />
              <span>How to accurately measure your wrist:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
              <li>Wrap a flexible strip of paper or cord snugly around your wrist bone.</li>
              <li>Mark the exact spot where the end meets with a pen.</li>
              <li>Lay the paper flat against a standard ruler to read the centimeter measurement.</li>
            </ol>
          </div>

          {/* Interactive Calculator Slider */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-botanical-forest">
                  1. Your Exact Wrist Circumference:
                </label>
                <span className="font-serif text-xl font-bold text-botanical-forest">
                  {measuredCm} cm
                </span>
              </div>
              <input
                type="range"
                min="13"
                max="21"
                step="0.5"
                value={measuredCm}
                onChange={(e) => setMeasuredCm(parseFloat(e.target.value))}
                className="w-full accent-botanical-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-botanical-forest/60 mt-1">
                <span>13 cm (Petite)</span>
                <span>17 cm (Average)</span>
                <span>21 cm (Large)</span>
              </div>
            </div>

            {/* Fit Preference */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-botanical-forest mb-2">
                2. Select Your Desired Fit:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'snug', label: 'Snug Fit', desc: '+0.5 cm (Stays in place)' },
                  { id: 'comfort', label: 'Comfort Fit', desc: '+1.5 cm (Gentle drape)' },
                  { id: 'loose', label: 'Relaxed / Loose', desc: '+2.5 cm (Free sliding)' },
                ].map((fit) => (
                  <button
                    key={fit.id}
                    onClick={() => setFitPreference(fit.id)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      fitPreference === fit.id
                        ? 'border-botanical-forest bg-botanical-bg ring-1 ring-botanical-forest'
                        : 'border-botanical-stone bg-white hover:border-botanical-sage'
                    }`}
                  >
                    <div className="text-xs font-semibold text-botanical-forest">
                      {fit.label}
                    </div>
                    <div className="text-[10px] text-botanical-forest/60 mt-0.5">
                      {fit.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-botanical-forest text-white rounded-3xl p-6 flex items-center justify-between shadow-botanical-lg">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-botanical-sage font-bold">
                Your Tailored Recommendation
              </span>
              <div className="font-serif text-3xl font-semibold mt-1">
                Size {recommendedSize} cm
              </div>
              <p className="text-xs text-botanical-clay font-sans mt-1">
                Classification: {category.label}
              </p>
            </div>

            <button
              onClick={closeWristGuide}
              className="py-3 px-6 rounded-full bg-botanical-sage hover:bg-botanical-terracotta text-botanical-forest hover:text-white font-semibold text-xs uppercase tracking-widest transition-all"
            >
              Apply Size
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
