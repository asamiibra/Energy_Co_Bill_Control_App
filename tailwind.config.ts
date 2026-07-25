import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A2540',
          50: '#E5EBF1',
          100: '#CCD8E4',
          200: '#99B1C9',
          300: '#668AAE',
          400: '#336393',
          500: '#0A2540',
          600: '#081E33',
          700: '#061626',
          800: '#040F1A',
          900: '#02070D',
        },
        orange: {
          DEFAULT: '#FF6B35',
          50: '#FFE8E0',
          100: '#FFD1C2',
          200: '#FFAB8A',
          300: '#FF8552',
          400: '#FF6B35',
          500: '#E54E1C',
          600: '#B33D15',
          700: '#802C0F',
          800: '#4D1B09',
          900: '#1A0903',
        },
      },
    },
  },
  plugins: [],
};

export default config;
