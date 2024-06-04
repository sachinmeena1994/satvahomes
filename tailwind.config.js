// tailwind.config.js
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      keyframes: {
        customFadeInScale: {
          '0%': { opacity: 0, transform: 'scale(0.7)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        customFadeOut: {
          '0%': { opacity: 1, transform: 'scale(1)' },
          '100%': { opacity: 0, transform: 'scale(0.7)' },
        },
        loading: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(50%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulsate: {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
      },
      animation: {
        customFadeInScale: 'customFadeInScale 1s ease forwards',
        customFadeOut: 'customFadeOut 1s ease forwards',
        loading: 'loading 1.5s infinite',
        pulsate: 'pulsate 1.5s infinite',
      },
      screens: {
        'xs': '480px',  // Custom breakpoint for extra small devices
        'sm': '640px',  // Tailwind's default small breakpoint
        'md': '768px',  // Tailwind's default medium breakpoint
        'lg': '1024px', // Tailwind's default large breakpoint
        'xl': '1280px', // Tailwind's default extra large breakpoint
        '2xl': '1536px',// Tailwind's default 2x large breakpoint
        '3xl': '1920px', // Custom breakpoint for extra large devices
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
