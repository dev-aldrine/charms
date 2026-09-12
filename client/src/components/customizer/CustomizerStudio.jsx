import React, { useState, useRef, useEffect } from 'react';
import { 
  CORD_OPTIONS, 
  GEMSTONE_OPTIONS, 
  CHARM_OPTIONS 
} from '../../data/catalogData';
import { formatPHP } from '../../utils/formatters';
import { useCartStore } from '../../store/useCartStore';
import { Sparkles, RefreshCw, Check, Info, ShieldCheck, Heart } from 'lucide-react';

export const CustomizerStudio = ({ initialProduct = null }) => {
  const [selectedCord, setSelectedCord] = useState(CORD_OPTIONS[0]);
  const [selectedGemstone, setSelectedGemstone] = useState(GEMSTONE_OPTIONS[0]);
  const [selectedAccentGem, setSelectedAccentGem] = useState(GEMSTONE_OPTIONS[1]);
  const [patternType, setPatternType] = useState('alternating'); // 'solid', 'alternating', 'focal'
  const [selectedCharm, setSelectedCharm] = useState(CHARM_OPTIONS[3]); // Engraved Bar
  const [wristSize, setWristSize] = useState(17);
  const [engravingText, setEngravingText] = useState('GRACE');
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  // Calculate customized total price
  const calculateTotal = () => {
    let base = selectedCord.basePrice;
    base += selectedGemstone.price * 6;
    if (patternType === 'alternating' || patternType === 'focal') {
      base += selectedAccentGem.price * 4;
    }
    if (selectedCharm) {
      base += selectedCharm.price;
    }
    if (engravingText.trim().length > 0) {
      base += 150; // Custom hand-engraving charge
    }
    return base;
  };

  const totalPrice = calculateTotal();

  const handleAddCustomToCart = () => {
    addItem({
      id: `custom-${Date.now()}`,
      name: `Custom ${selectedGemstone.name} & ${selectedCord.name}`,
      price: totalPrice,
      image: 'https://images.unsplash.com/photo-1611591475102-460d7f631545?auto=format&fit=crop&w=800&q=80',
      wristSize,
      cord: selectedCord.name,
      gemstone: selectedGemstone.name,
      accentGem: (patternType !== 'solid') ? selectedAccentGem.name : null,
      charm: selectedCharm ? selectedCharm.name : null,
      engravingText: engravingText.trim().toUpperCase() || null,
      isCustom: true
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <section className="py-12 md:py-20 max-w-7xl mx-auto px-6 md:px-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-[0.25em] text-botanical-sage font-semibold">
          Artisanal Atelier
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-semibold text-botanical-forest mt-3">
          Interactive <span className="italic font-normal text-botanical-terracotta">Customizer</span> Studio
        </h2>
        <p className="font-sans text-botanical-forest/70 text-base md:text-lg mt-4 leading-relaxed">
          Craft your one-of-a-kind energy bracelet. Select natural mined gemstones, pure cords, symbolic charms, and personalized hand-stamped engravings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Col: Real-time Visual Customizer Canvas */}
        <div className="lg:col-span-6 sticky top-28 bg-white rounded-4xl p-8 border border-botanical-stone shadow-botanical-md flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between text-xs text-botanical-forest/60 mb-4 pb-3 border-b border-botanical-stone">
            <span className="uppercase tracking-widest font-medium">Visual Studio Preview</span>
            <span className="bg-botanical-bg px-3 py-1 rounded-full text-botanical-forest font-serif">
              {wristSize}cm Circumference
            </span>
          </div>

          {/* SVG Visual Bracelet Studio */}
          <div className="relative w-full aspect-square max-w-[420px] flex items-center justify-center bg-botanical-bg/60 rounded-3xl p-6 border border-botanical-stone/50 overflow-hidden">
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-lg">
              {/* Outer Cord Ring */}
              <circle
                cx="200"
                cy="200"
                r="135"
                fill="none"
                stroke={selectedCord.color}
                strokeWidth={selectedCord.id === 'silver-chain' || selectedCord.id === 'gold-vermeil' ? '8' : '6'}
                strokeDasharray={selectedCord.id.includes('macrame') ? '4 2' : 'none'}
              />

              {/* Render 20 Organic Spherical Beads in a Circle */}
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i * 360) / 20;
                const radian = (angle * Math.PI) / 180;
                const radius = 135;
                const cx = 200 + radius * Math.cos(radian);
                const cy = 200 + radius * Math.sin(radian);

                let beadColor = selectedGemstone.color;
                if (patternType === 'alternating' && i % 2 === 1) {
                  beadColor = selectedAccentGem.color;
                } else if (patternType === 'focal' && (i === 4 || i === 5 || i === 15 || i === 16)) {
                  beadColor = selectedAccentGem.color;
                }

                // If position is at bottom (i == 5), leave space for Charm/Engraving Tag
                if (i === 5 && selectedCharm) return null;

                return (
                  <g key={i}>
                    {/* Shadow underneath */}
                    <circle cx={cx + 1} cy={cy + 2} r="14" fill="rgba(45, 58, 49, 0.15)" />
                    {/* Main Bead Gradient Fill */}
                    <circle cx={cx} cy={cy} r="13" fill={beadColor} />
                    {/* Gloss / Specular Light Reflection */}
                    <ellipse
                      cx={cx - 3}
                      cy={cy - 4}
                      rx="4"
                      ry="2"
                      fill="rgba(255, 255, 255, 0.45)"
                      transform={`rotate(-30 ${cx - 3} ${cy - 4})`}
                    />
                  </g>
                );
              })}

              {/* Bottom Hanging Charm / Engraved Tag */}
              {selectedCharm && (
                <g transform="translate(200, 335)">
                  {/* Jump ring */}
                  <circle cx="0" cy="0" r="5" fill="none" stroke="#D4AF37" strokeWidth="2" />
                  {/* Charm Pendant Plate */}
                  <rect
                    x="-24"
                    y="6"
                    width="48"
                    height="20"
                    rx="10"
                    fill="#D4AF37"
                    stroke="#B38F24"
                    strokeWidth="1"
                  />
                  {/* Engraved Monogram/Text */}
                  <text
                    x="0"
                    y="20"
                    fill="#2D3A31"
                    fontSize="9"
                    fontFamily="serif"
                    fontWeight="bold"
                    textAnchor="middle"
                    letterSpacing="1.5"
                  >
                    {engravingText || 'AURA'}
                  </text>
                </g>
              )}
            </svg>

            {/* Floating Live Aesthetic Tag */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-medium text-botanical-forest border border-botanical-stone shadow-sm">
              ✨ {selectedGemstone.name} + {selectedCord.name}
            </div>
          </div>

          {/* Pricing & Add Action */}
          <div className="w-full mt-6 pt-6 border-t border-botanical-stone flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-botanical-forest/60">
                Customized Total
              </div>
              <div className="font-serif text-2xl md:text-3xl font-semibold text-botanical-forest">
                {formatPHP(totalPrice)}
              </div>
            </div>

            <button
              onClick={handleAddCustomToCart}
              className={`py-3.5 px-8 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 ${
                isAdded
                  ? 'bg-botanical-sage text-white'
                  : 'bg-botanical-forest hover:bg-botanical-terracotta text-white shadow-botanical-md'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Add Custom Piece</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Col: Interactive Control Palette */}
        <div className="lg:col-span-6 space-y-8">
          {/* 1. Base Cord & Material */}
          <div className="bg-white rounded-3xl p-6 border border-botanical-stone shadow-botanical-sm">
            <h3 className="font-serif text-lg font-semibold text-botanical-forest mb-4 flex items-center justify-between">
              <span>1. Base Cord &amp; Metal</span>
              <span className="text-xs font-sans font-normal text-botanical-sage">
                {selectedCord.material}
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {CORD_OPTIONS.map((cord) => (
                <button
                  key={cord.id}
                  onClick={() => setSelectedCord(cord)}
                  className={`p-3.5 rounded-2xl text-left border transition-all duration-300 ${
                    selectedCord.id === cord.id
                      ? 'border-botanical-forest bg-botanical-bg shadow-sm ring-1 ring-botanical-forest'
                      : 'border-botanical-stone hover:border-botanical-sage bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-botanical-stone"
                      style={{ backgroundColor: cord.color }}
                    />
                    <span className="text-xs font-medium text-botanical-forest">
                      {cord.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-botanical-forest/60 mt-1">
                    {formatPHP(cord.basePrice)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Primary Natural Gemstone */}
          <div className="bg-white rounded-3xl p-6 border border-botanical-stone shadow-botanical-sm">
            <h3 className="font-serif text-lg font-semibold text-botanical-forest mb-2">
              2. Primary Energy Gemstone
            </h3>
            <p className="text-xs text-botanical-forest/70 mb-4 font-sans">
              Select Grade A mined minerals imbued with soothing botanical qualities.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GEMSTONE_OPTIONS.map((gem) => (
                <button
                  key={gem.id}
                  onClick={() => setSelectedGemstone(gem)}
                  className={`p-3 rounded-2xl flex flex-col items-center text-center border transition-all duration-300 ${
                    selectedGemstone.id === gem.id
                      ? 'border-botanical-forest bg-botanical-bg ring-1 ring-botanical-forest'
                      : 'border-botanical-stone hover:border-botanical-sage bg-white'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full mb-2 shadow-inner border border-white"
                    style={{ backgroundColor: gem.color }}
                  />
                  <span className="text-xs font-medium text-botanical-forest leading-tight">
                    {gem.name}
                  </span>
                  <span className="text-[10px] text-botanical-forest/60 mt-1">
                    +{formatPHP(gem.price)}/ea
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Pattern & Secondary Accent */}
          <div className="bg-white rounded-3xl p-6 border border-botanical-stone shadow-botanical-sm">
            <h3 className="font-serif text-lg font-semibold text-botanical-forest mb-3">
              3. Stringing Harmony &amp; Accent
            </h3>
            <div className="flex gap-2 mb-4">
              {['solid', 'alternating', 'focal'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPatternType(mode)}
                  className={`flex-1 py-2 rounded-full text-xs font-medium uppercase tracking-wider capitalize transition-all duration-300 ${
                    patternType === mode
                      ? 'bg-botanical-forest text-white'
                      : 'bg-botanical-bg text-botanical-forest/70 hover:bg-botanical-stone'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {patternType !== 'solid' && (
              <div>
                <span className="text-xs text-botanical-forest/70 font-medium block mb-2">
                  Secondary Accent Gemstone:
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {GEMSTONE_OPTIONS.map((gem) => (
                    <button
                      key={gem.id}
                      onClick={() => setSelectedAccentGem(gem)}
                      className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 border whitespace-nowrap transition-all duration-300 ${
                        selectedAccentGem.id === gem.id
                          ? 'border-botanical-forest bg-botanical-bg font-medium'
                          : 'border-botanical-stone hover:border-botanical-sage'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: gem.color }} />
                      <span>{gem.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Charm & Hand Engraving */}
          <div className="bg-white rounded-3xl p-6 border border-botanical-stone shadow-botanical-sm">
            <h3 className="font-serif text-lg font-semibold text-botanical-forest mb-4">
              4. Botanical Charm &amp; Monogram Engraving
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
              {CHARM_OPTIONS.map((charm) => (
                <button
                  key={charm.id}
                  onClick={() => setSelectedCharm(charm)}
                  className={`p-3 rounded-2xl text-left border transition-all duration-300 ${
                    selectedCharm?.id === charm.id
                      ? 'border-botanical-forest bg-botanical-bg ring-1 ring-botanical-forest'
                      : 'border-botanical-stone hover:border-botanical-sage bg-white'
                  }`}
                >
                  <div className="text-xs font-medium text-botanical-forest">
                    {charm.name}
                  </div>
                  <div className="text-[10px] text-botanical-forest/60 mt-0.5">
                    {formatPHP(charm.price)}
                  </div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-botanical-forest/70 font-medium mb-1.5">
                Custom Engraving Text (Max 8 letters) — +₱150
              </label>
              <input
                type="text"
                maxLength={8}
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value.toUpperCase())}
                placeholder="e.g. GRACE, 08.24"
                className="w-full bg-botanical-bg border border-botanical-stone rounded-full px-5 py-2.5 text-sm uppercase tracking-widest text-botanical-forest focus:outline-none focus:border-botanical-forest focus:ring-1 focus:ring-botanical-forest"
              />
            </div>
          </div>

          {/* 5. Wrist Sizing */}
          <div className="bg-white rounded-3xl p-6 border border-botanical-stone shadow-botanical-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-lg font-semibold text-botanical-forest">
                5. Wrist Circumference
              </h3>
              <span className="text-xs font-semibold text-botanical-terracotta">
                {wristSize} cm
              </span>
            </div>
            <input
              type="range"
              min="14"
              max="21"
              step="1"
              value={wristSize}
              onChange={(e) => setWristSize(Number(e.target.value))}
              className="w-full accent-botanical-forest cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-botanical-forest/60 mt-1 uppercase tracking-wider font-medium">
              <span>14cm (Petite)</span>
              <span>17cm (Standard)</span>
              <span>21cm (Relaxed)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
