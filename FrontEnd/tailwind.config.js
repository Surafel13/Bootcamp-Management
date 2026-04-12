export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#7C6CF2',
        'primary-light': '#A89CF7',
        'primary-hover': '#6D5CE7',
        'primary-soft': '#F3F2FF',
        'surface-bg': '#F5F6FA',
        'surface-card': '#FFFFFF',
        'surface-border': '#E6E8EC',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        success: '#22C55E',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}