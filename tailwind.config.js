/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lazo: {
          primary: '#0D4744',
          'primary-hover': '#093634',
          'primary-light': '#185B57',
          sage: '#EBF5F3',
          'sage-border': '#D0E8E3',
          mint: '#D8EDE9',
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          emergency: '#DC2626',
          'emergency-light': '#FEF2F2',
          'emergency-border': '#FECACA'
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(13, 71, 68, 0.03), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 30px -5px rgba(13, 71, 68, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.03)'
      }
    },
  },
  plugins: [],
}
