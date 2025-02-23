import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: 'rgba(255, 108, 180, 0.8)', // 共通カラー
          dark: 'rgba(229, 97, 162, 0.8)',     // より濃いピンク
          women: 'rgba(255, 108, 180, 0.8)',   // 同じ色を使用
        },
      },
    },
  },
  plugins: [],
}
export default config 