import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sky:    { brand: '#7DD3FC' },
        mint:   { brand: '#A7F3D0' },
        peach:  { brand: '#FECACA' },
        gold:   { brand: '#FCD34D' },
        grape:  { brand: '#C4B5FD' },
        cream:  { brand: '#FEF3C7' },
      },
      boxShadow: {
        'soft': '0 20px 40px -10px rgba(0,0,0,0.15)',
        '3d':   '0 10px 0 #d4d4d4, 0 15px 25px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        'big':  '24px',
        'huge': '40px',
      },
      fontFamily: {
        cute: ['"ZCOOL KuaiLe"', '"LXGW WenKai"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
