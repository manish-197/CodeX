/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Master Doctor / Hospital / Healthcare Palette
        'clinical-white': '#F4F9FB',
        'medical-blue': '#2563A6',
        'medical-blue-hover': '#1d4f85',
        'medical-blue-light': '#e0ecf8',
        'soft-cyan': '#5FB3CE',
        'soft-cyan-hover': '#4ca0bb',
        'soft-cyan-light': '#eaf5f8',
        'health-green': '#2E9E5B',
        'health-green-light': '#e5f6ec',
        'alert-red': '#D64545',
        'alert-red-hover': '#bc3232',
        'alert-red-light': '#fbe8e8',
        'caution-amber': '#E8A93A',
        'caution-amber-light': '#fdf5e6',
        'deep-navy': '#0B2A4A',
        'deep-navy-dark': '#061a2f',
        'deep-navy-light': '#18426d',

        // Backward compatibility token mapping to new healthcare colors
        'terracotta': '#2563A6',
        'terracotta-hover': '#1d4f85',
        'terracotta-light': '#e0ecf8',
        'deep-teal': '#0B2A4A',
        'deep-teal-dark': '#061a2f',
        'deep-teal-light': '#18426d',
        'sky-mist': '#F4F9FB',
        'sun-gold': '#E8A93A',
        'sun-gold-light': '#fdf5e6',
        'leaf-green': '#2E9E5B',
        'leaf-green-light': '#e5f6ec',
        'alert-crimson': '#D64545',
        'alert-crimson-hover': '#bc3232',
        'alert-crimson-light': '#fbe8e8',

        dark: {
          base: '#071524',
          card: '#0D2036',
          border: '#173656',
          text: '#F4F9FB',
          muted: '#8FAFCB',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Poppins', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'neo-glass': '0 8px 32px 0 rgba(11, 42, 74, 0.08)',
        'neo-hover': '0 12px 40px 0 rgba(37, 99, 166, 0.16)',
        'neo-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
