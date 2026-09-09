import { BRAND_CONFIG } from './src/brandConfig.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          bg: BRAND_CONFIG.theme.bg,
          forest: BRAND_CONFIG.theme.forest,
          sage: BRAND_CONFIG.theme.sage,
          clay: BRAND_CONFIG.theme.clay,
          stone: BRAND_CONFIG.theme.stone,
          terracotta: BRAND_CONFIG.theme.terracotta,
          card: '#FFFFFF',
          cardMuted: '#F2F0EB'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '36px',
      },
      boxShadow: {
        'botanical-sm': '0 4px 6px -1px rgba(45, 58, 49, 0.05)',
        'botanical-md': '0 10px 15px -3px rgba(45, 58, 49, 0.05)',
        'botanical-lg': '0 20px 40px -10px rgba(45, 58, 49, 0.05)',
        'botanical-xl': '0 25px 50px -12px rgba(45, 58, 49, 0.12)',
      }
    },
  },
  plugins: [],
}
