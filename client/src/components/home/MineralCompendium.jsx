import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gem, Compass, ShieldCheck, Heart, Eye } from 'lucide-react';
import { GEMSTONE_OPTIONS } from '../../data/catalogData';

const MINERAL_LORE = [
  {
    id: 'jade',
    name: 'Burmese Jadeite',
    color: '#4E7D5B',
    chakra: 'Heart Chakra',
    element: 'Wood / Earth',
    energy: 'Tranquil Balance & Abundance',
    lore: 'Cherished by ancient royal dynasties as the stone of heaven, revered for harmonizing vital qi and calming the nervous system.',
    hardness: '6.5 - 7.0 Mohs'
  },
  {
    id: 'rosequartz',
    name: 'Madagascar Rose Quartz',
    color: '#E8B4B8',
    chakra: 'Higher Heart',
    element: 'Water',
    energy: 'Unconditional Compassion & Inner Peace',
    lore: 'Radiates gentle maternal frequencies, softening emotional tensions and encouraging profound self-forgiveness and tenderness.',
    hardness: '7.0 Mohs'
  },
  {
    id: 'obsidian',
    name: 'Volcanic Obsidian',
    color: '#1F2421',
    chakra: 'Root Chakra',
    element: 'Fire / Earth',
    energy: 'Deep Psychic Grounding & Shielding',
    lore: 'Born in raw volcanic cooling, obsidian acts as an impenetrable mirror reflecting negative vibrational patterns away from the aura.',
    hardness: '5.0 - 5.5 Mohs'
  },
  {
    id: 'lapis',
    name: 'Royal Lapis Lazuli',
    color: '#274472',
    chakra: 'Third Eye & Throat',
    element: 'Wind / Ether',
    energy: 'Intuitive Clarity & Sovereign Truth',
    lore: 'Adorned the burial masks of pharaohs. Golden pyrite flecks evoke celestial starlight across the deep indigo night sky.',
    hardness: '5.5 - 6.0 Mohs'
  }
];

export const MineralCompendium = ({ onSelectGem }) => {
  const [activeTab, setActiveTab] = useState(MINERAL_LORE[0]);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-2">
      <div className="bg-white rounded-4xl p-6 sm:p-10 md:p-12 border border-botanical-stone shadow-botanical-md">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-botanical-sage font-bold flex items-center justify-center gap-1.5">
            <Gem className="w-3.5 h-3.5 text-botanical-sage" />
            <span>Mineralogical Encyclopedia</span>
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-botanical-forest">
            Living Energy <span className="italic font-normal text-botanical-terracotta">&amp;</span> Mineral Lore
          </h2>
          <p className="text-xs sm:text-sm text-botanical-forest/70 font-sans leading-relaxed">
            Every gemstone chosen by Joy’s Atelier is tested for structural resonance, natural origin, and energetic harmony.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4 mb-10">
          {MINERAL_LORE.map((mineral) => (
            <button
              key={mineral.id}
              onClick={() => setActiveTab(mineral)}
              className={`py-3 px-5 sm:px-6 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-all duration-300 ${
                activeTab.id === mineral.id
                  ? 'bg-botanical-forest text-white shadow-botanical-md ring-2 ring-botanical-forest/20'
                  : 'bg-botanical-bg border border-botanical-stone text-botanical-forest hover:border-botanical-sage'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-sm"
                style={{ backgroundColor: mineral.color }}
              />
              <span>{mineral.name}</span>
            </button>
          ))}
        </div>

        {/* Mineral Details Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="bg-botanical-bg rounded-3xl p-6 sm:p-10 border border-botanical-stone grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Orb Visualizer */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center p-3 shadow-2xl bg-white border border-botanical-stone">
                <div
                  className="w-full h-full rounded-full shadow-inner relative overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${activeTab.color}, #1A202C)`,
                  }}
                >
                  <div className="absolute top-4 left-6 w-12 h-6 bg-white/30 rounded-full blur-xs -rotate-45" />
                </div>
              </div>
              <div>
                <strong className="font-serif text-xl text-botanical-forest block">{activeTab.name}</strong>
                <span className="text-[11px] uppercase tracking-widest text-botanical-forest/60 font-mono">
                  {activeTab.hardness}
                </span>
              </div>
            </div>

            {/* Right Lore & Attributes */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-botanical-stone/80 pb-6 text-xs">
                <div>
                  <span className="text-botanical-forest/50 uppercase tracking-widest block text-[10px] mb-1 font-mono">Resonance</span>
                  <strong className="text-botanical-forest font-semibold">{activeTab.energy}</strong>
                </div>
                <div>
                  <span className="text-botanical-forest/50 uppercase tracking-widest block text-[10px] mb-1 font-mono">Chakra Alignment</span>
                  <strong className="text-botanical-forest font-semibold">{activeTab.chakra}</strong>
                </div>
                <div>
                  <span className="text-botanical-forest/50 uppercase tracking-widest block text-[10px] mb-1 font-mono">Natural Element</span>
                  <strong className="text-botanical-forest font-semibold">{activeTab.element}</strong>
                </div>
              </div>

              <p className="font-serif italic text-base sm:text-lg text-botanical-forest/90 leading-relaxed">
                "{activeTab.lore}"
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
