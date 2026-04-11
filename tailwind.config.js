/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-1': '#4A4FED',
        'primary-2': '#6574FC',
        'primary-4': '#BBCBFC',
        'primary-6': '#EBF1FF',
        'fill-light': '#F5FAFF',
        'fill-gray-1': '#F0F2F7',
        'gray-1': '#101019',
        'gray-2': '#444963',
        'gray-3': '#646B8A',
        'gray-4': '#838BAB',
        'line-1': '#E9ECF5',
        'line-2': '#DFE3F0',
        'line-3': '#CFD5E8',
        'orange-1': '#FA9524',
        'orange-5': '#FFF3E6',
        'green-0': '#2DC01F',
        'green-5': '#EAF7E6',
      },
      fontFamily: {
        sans: [
          '"Alibaba PuHuiTi 3.0"',
          '"Noto Sans SC"',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        s: '0px 4px 8px 0px rgba(16,16,25,0.04)',
        m: '0px 8px 32px 0px rgba(16,16,25,0.1)',
        high: '0px 16px 56px 0px rgba(16,18,25,0.08)',
      },
    },
  },
  plugins: [],
};
