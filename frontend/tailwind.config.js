export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Arial', 'Calibri', 'Helvetica', 'sans-serif'],
        sans: ['Arial', 'Calibri', 'Helvetica', 'sans-serif'],
        mono: ['"Courier New"', 'Consolas', 'monospace'],
      },
      colors: {
        editorial: {
          background: '#FAFAF8',
          foreground: '#1A1A1A',
          muted: '#F5F3F0',
          subtle: '#6B6B6B',
          border: '#E8E4DF',
          accent: '#B8860B',
          accentLight: '#D4A84B',
          card: '#FFFFFF',
        },
      },
      boxShadow: {
        editorial: '0 4px 12px rgba(26, 26, 26, 0.06)',
        'editorial-lg': '0 8px 24px rgba(26, 26, 26, 0.08)',
      },
    },
  },
  plugins: [],
}
