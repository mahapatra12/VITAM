/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"',
          'Manrope', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif',
        ],
        display: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Manrope', 'sans-serif',
        ],
        mono: [
          '"SF Mono"', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace',
        ],
      },
      colors: {
        appleBlue:       '#0A84FF',
        appleBlueDark:   '#0071e3',
        applePurple:     '#5E5CE6',
        appleGreen:      '#30D158',
        appleRed:        '#FF453A',
        appleOrange:     '#FF9F0A',
        appleYellow:     '#FFD60A',
        appleBackground: '#F5F5F7',
        appleDarkBg:     '#05070C',
        appleDarkElev:   '#0B0F17',
        appleCard:       '#FFFFFF',
        appleDarkCard:   '#141821',
      },
      borderRadius: {
        'apple':    '14px',
        'apple-lg': '20px',
        'apple-xl': '28px',
        'squircle': '22px',
      },
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
      backdropBlur: {
        xs:   '4px',
        '2xl': '28px',
        '3xl': '40px',
      },
      boxShadow: {
        'apple-sm':   '0 1px 2px rgba(2,6,23,0.35)',
        'apple-md':   '0 8px 24px rgba(2,6,23,0.35)',
        'apple-lg':   '0 20px 48px rgba(2,6,23,0.45)',
        'apple-glow': '0 10px 24px rgba(10,132,255,0.28)',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
