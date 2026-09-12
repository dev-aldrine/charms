# Joy's Atelier (`bracelet`) — Architecture & Codebase Guide

> **Quick Reference**: This file is a comprehensive guide to the repository structure, tech stack, state management, components, and deployment setup for any developer or AI assistant working on this codebase.

---

## 1. Tech Stack Overview

- **Monorepo Layout**: Root orchestrator (`package.json`), React frontend (`client/`), Express backend (`server/`), and Vercel serverless bridge (`api/`).
- **Frontend**: React 18/19, Vite, Tailwind CSS (Botanical Serif theme), Framer Motion (`framer-motion`), Zustand (with `persist` to `localStorage`), `lucide-react`, `canvas-confetti`.
- **Backend**: Express.js with CORS, JSON parser, and in-memory order store. Dual-export for both standard Node.js server (`server/src/server.js`) and Vercel Serverless Function (`api/index.js`).
- **Testing**: Vitest (`client/src/test/cart.test.js`) + `@testing-library/react` + `jsdom`.
- **Styling Tokens**: Botanical Palette (`#1C2E24` Forest, `#6E8B76` Sage, `#FAFAF7` Linen BG, `#C2A649` Gold, `#C47253` Terracotta).

---

## 2. Directory & File Breakdown

```
bracelet/
├── .gitignore                      # Git ignore rules
├── vercel.json                     # Unified Vercel config (client + serverless /api/*)
├── package.json                    # Root scripts (dev, start, build, test)
├── README.md                       # Architecture & codebase documentation
├── api/
│   └── index.js                    # Vercel serverless entrypoint importing server.js
├── server/
│   ├── package.json                # Express server dependencies
│   └── src/
│       └── server.js               # Express API endpoints (/api/products, /api/payments/qrph/create, /api/webhooks)
└── client/
    ├── index.html                  # HTML entry with Playfair Display & Plus Jakarta Sans fonts
    ├── package.json                # Client dependencies & scripts
    ├── tailwind.config.js          # Botanical theme color tokens & font families
    ├── vite.config.js              # Vite & Vitest configuration
    ├── public/images/              # SVG bracelet assets and official QR Ph WebP logo
    └── src/
        ├── App.jsx                 # App shell, router state, CartDrawer & CheckoutModal mounting
        ├── brandConfig.js          # Brand constants ("JOY'S ATELIER"), logos, and metadata
        ├── index.css               # Global CSS & Tailwind imports
        ├── data/
        │   └── catalogData.js      # 20 curated bracelet products with gemstone specs & pricing
        ├── store/
        │   └── useCartStore.js     # Zustand store for cart items, shipping logic, and checkout modal
        ├── utils/
        │   └── formatters.js       # formatPHP currency formatter
        ├── test/
        │   ├── setup.js            # Vitest mock setup
        │   └── cart.test.js        # Cart quantity and price calculation tests
        ├── pages/
        │   ├── HomePage.jsx        # Main landing page (Hero, Editorial, Products, Compendium, Reviews)
        │   └── AtelierStory.jsx    # Brand heritage and mineral ethics story page
        └── components/
            ├── common/
            │   └── NoiseOverlay.jsx         # Texture grain overlay
            ├── core/
            │   ├── InView.jsx               # Framer motion viewport trigger
            │   ├── Spotlight.jsx            # Dynamic card spotlight sheen
            │   ├── TextEffect.jsx           # Animated text typography
            │   └── TransitionPanel.jsx      # Animated wizard step switcher
            ├── layout/
            │   ├── Navbar.jsx               # Sticky glassmorphism header
            │   └── Footer.jsx               # Atelier footer
            ├── home/
            │   ├── FullWidthHeroCarousel.jsx # 85vh full-bleed hero carousel
            │   ├── EditorialCarousel.jsx    # Fluid multi-column image feed
            │   ├── MineralCompendium.jsx    # Gemstone compendium
            │   └── ReviewsAndEthos.jsx      # Testimonials and sustainability badges
            ├── product/
            │   ├── ProductCard.jsx          # 1:1 card with size selector & customizer link
            │   └── WristSizeGuideModal.jsx  # Interactive wrist sizing modal
            ├── customizer/
            │   └── CustomizerStudio.jsx     # Live SVG customizer (beads, cord, engraving)
            ├── cart/
            │   └── CartDrawer.jsx           # Animated slide-over cart with free shipping bar
            └── checkout/
                └── CheckoutModal.jsx        # PayMongo QR Ph 3-step payment flow with simulator
```

---

## 3. State Management & Data Flow

- **Cart State (`useCartStore.js`)**:
  - Saved to `localStorage` under key `'aura-botanica-cart'`.
  - Adding items merges matching `(productId + selectedSize + customEngraving)`.
  - Calculates subtotal, free shipping threshold (> ₱3,500 = ₱0 shipping; else ₱150), and grand total.
- **Product Catalog (`catalogData.js`)**:
  - 20 products categorized into *Men's, Women's, Couples, Feng Shui, Bespoke*.
  - Rendered on `HomePage.jsx` with category filter tabs and responsive pagination.

---

## 4. Payment Flow (PayMongo QR Ph)

1. User clicks **"Proceed to QR Ph Checkout"** in `CartDrawer`.
2. `CheckoutModal.jsx` opens:
   - **Step 1 (Bespoke Details)**: Customer name, shipping address, contact info.
   - **Step 2 (Scan to Pay)**: Generates dynamic QR Ph code image URL, displays official QR Ph badge and 10-minute countdown timer. Includes a **"Simulate Payment (Test Mode)"** button.
   - **Step 3 (Confirmation)**: Fires confetti explosion, displays unique order ID (`AB-XXXXXX`), and updates crafting status.

---

## 5. Development & Deployment

### Run Locally (Zero Config):
```bash
npm install
npm install --prefix client
npm install --prefix server
npm run dev      # Starts client on http://localhost:5173 & server on http://localhost:5000
```

### Run Tests:
```bash
npm run test     # Runs Vitest suite
```

### Deploy to Vercel:
- **Repo**: `https://github.com/dev-aldrine/charms`
- **Root Directory**: `./` (Default)
- `vercel.json` automatically handles static frontend hosting and routes `/api/*` to serverless backend functions.
