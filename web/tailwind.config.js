/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      colors: {
        'vim-bg': '#ffffff',
        'vim-fg': '#000000',
        'vim-accent': '#4ade80',
        'vim-error': '#ef4444',
        'vim-gray': '#6b7280',
      }
    },
  },
  plugins: [],
}