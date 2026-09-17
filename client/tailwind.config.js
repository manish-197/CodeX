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
        'sky-mist': '#EAF4F4',
        'terracotta': '#E4714E',
        'terracotta-hover': '#cf5a37',
        'terracotta-light': '#f9ded6',
        'deep-teal': '#0F5E5E',
        'deep-teal-dark': '#0a4242',
        'deep-teal-light': '#1b8080',
        'sun-gold': '#F4B942',
        'sun-gold-light': '#fdf1d4',
        'alert-crimson': '#D64550',
        'alert-crimson-hover': '#be343f',
        'alert-crimson-light': '#fad9dc',
        'leaf-green': '#4C9A6A',
        'leaf-green-light': '#dbede2',
        dark: {
          base: '#0B1616',
          card: '#132424',
          border: '#1E3838',
          text: '#EAF4F4',
          muted: '#8FA8A8'
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
        'neo-glass': '0 8px 32px 0 rgba(15, 94, 94, 0.08)',
        'neo-hover': '0 12px 40px 0 rgba(228, 113, 78, 0.16)',
        'neo-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
