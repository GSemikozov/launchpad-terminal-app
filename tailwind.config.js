/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Pump.fun inspired palette
        primary: {
          DEFAULT: '#FF00FF',
          light: '#FF66FF',
          dark: '#CC00CC',
        },
        secondary: {
          DEFAULT: '#14F195',
          light: '#5FFBC1',
          dark: '#0FBE6C',
        },
        accent: {
          cyan: '#00FFFF',
          blue: '#4B99FF',
          purple: '#9945FF',
        },
        dark: {
          DEFAULT: '#0A0B0D',
          lighter: '#1A1B23',
          card: '#1E1F2E',
          border: '#2A2B3A',
        },
        success: '#14F195',
        error: '#FF3B69',
        warning: '#FFB800',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': {
            boxShadow: '0 0 5px rgba(255, 0, 255, 0.5), 0 0 10px rgba(255, 0, 255, 0.3)',
          },
          '100%': {
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.8), 0 0 30px rgba(255, 0, 255, 0.5)',
          },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF00FF 0%, #9945FF 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #14F195 0%, #00FFFF 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0A0B0D 0%, #1A1B23 100%)',
        'gradient-card': 'linear-gradient(135deg, #1E1F2E 0%, #2A2B3A 100%)',
      },
    },
  },
  plugins: [],
};
