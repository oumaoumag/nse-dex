/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      container: {
        center: true,
        padding: '1.5rem',
        screens: {
          '2xl': '1440px',
        },
      },
      colors: {
        // Safaricom Decode color palette
        primary: {
          50: '#f0f4ff',
          100: '#dee8ff',
          200: '#c1d4ff',
          300: '#9ab8ff',
          400: '#7593ff',
          500: '#4f6ef7', // Secondary blue accent 
          600: '#4147e5',
          700: '#3a3dbf',
          800: '#2e2d8a',
          900: '#272e6e',
          950: '#0a102d',
        },
        secondary: {
          50: '#ebfef7',
          100: '#d0fbeb',
          200: '#a5f5d8',
          300: '#42e5ad',
          400: '#21cd8d',
          500: '#00bd5f', // Main Safaricom green
          600: '#009652',
          700: '#007544',
          800: '#065d39',
          900: '#064d32',
          950: '#01291c',
        },
        accent: {
          50: '#fff8eb',
          100: '#ffedc7',
          200: '#ffd988',
          300: '#ffbf49',
          400: '#ffa71e',
          500: '#ff8800', // Accent color
          600: '#e06200',
          700: '#ba4300',
          800: '#983500',
          900: '#7c2e00',
          950: '#421500',
        },
        // New Safaricom Decode specific colors
        decode: {
          black: '#000000',
          white: '#ffffff',
          green: '#00bd5f',
          blue: '#4f6ef7',
          gray: '#f5f5f5',
          darkgray: '#333333',
          glassbg: 'rgba(255, 255, 255, 0.05)'
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideUp: 'slideUp 0.5s ease-out',
      },
    },
  },
  plugins: [],
}; 