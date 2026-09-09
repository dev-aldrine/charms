import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    id: 'rev_1',
    author: 'Camille R.',
    location: 'Makati City, PH',
    item: 'Verdant Jade & Gold Rondelle (16cm)',
    rating: 5,
    date: 'Verified Buyer',
    comment: 'The jade has such a soothing, cool weight against the skin. The millimeter custom fit is exact—no sliding around while I work at my desk.',
  },
  {
    id: 'rev_2',
    author: 'Enrico D.',
    location: 'Cebu City, PH',
    item: 'Volcanic Obsidian & Matte Onyx (18cm)',
    rating: 5,
    date: 'Verified Buyer',
    comment: 'Paid via GCash QR Ph in 5 seconds and received the tracking within 2 days. The craft quality of the cord and minerals is unmistakably top-tier.',
  },
  {
    id: 'rev_3',
    author: 'Kristine & Marco',
    location: 'Quezon City, PH',
    item: 'Elysian Duo Couple Set (Custom Engraved)',
    rating: 5,
    date: 'Verified Buyer',
    comment: 'The interlocking engraved bar charm is gorgeous. Packaging arrived infused with natural botanical sage aroma. Made our anniversary very special.',
  }
];

export const ReviewsAndEthos = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-2">
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-botanical-sage font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-botanical-sage" />
          <span>Client Voices &amp; Atelier Care</span>
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-botanical-forest">
          Cherished by <span className="italic font-normal text-botanical-terracotta">Collectors</span> Nationwide
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {REVIEWS.map((rev, idx) => (
          <motion.div
            key={rev.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-white rounded-3xl p-8 border border-botanical-stone shadow-botanical-sm flex flex-col justify-between hover:shadow-botanical-md transition-shadow"
          >
            <div className="space-y-4">
              {/* 5 Stars */}
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-botanical-forest/80 font-sans leading-relaxed">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-6 border-t border-botanical-stone/60 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-sm font-serif font-semibold text-botanical-forest block">
                    {rev.author}
                  </strong>
                  <span className="text-[11px] text-botanical-forest/60 font-sans">
                    {rev.location}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-botanical-sage bg-botanical-bg px-2.5 py-1 rounded-full border border-botanical-stone">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{rev.date}</span>
                </div>
              </div>
              <div className="text-[10px] text-botanical-terracotta font-medium mt-2">
                Purchased: {rev.item}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
