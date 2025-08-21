/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}', // Include UI package
  ],
  presets: [require('../../packages/ui/tailwind.config.js')], // Extend UI config
  theme: {
    extend: {
      // App-specific theme extensions
    },
  },
  plugins: [],
};
