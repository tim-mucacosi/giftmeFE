import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#ff6b6b',
          light: '#ff8787',
          dark: '#e85d5d',
        },
        gold: {
          DEFAULT: '#ffd93d',
          light: '#ffe066',
        },
        dark: {
          DEFAULT: '#2d3436',
          light: '#636e72',
        },
        gray: {
          light: '#dfe6e9',
          DEFAULT: '#b2bec3',
        },
        bg: '#fffaf8',
        'red-soft': '#faa6a6',
        success: '#55efc4',
      },
      maxWidth: {
        container: '1280px',
      },
      boxShadow: {
        cta: '0 4px 14px rgba(255, 107, 107, 0.4)',
        'cta-hover': '0 6px 20px rgba(255, 107, 107, 0.5)',
        card: '0 2px 12px rgba(45, 52, 54, 0.08)',
        'card-hover': '0 6px 24px rgba(45, 52, 54, 0.14)',
      },
    },
  },
  plugins: [],
}

export default config
