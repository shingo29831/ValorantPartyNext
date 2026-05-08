import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./logic/**/*.{js,ts,jsx,tsx,mdx}" // 念のためlogicフォルダも追加
  ],
  theme: {
    extend: {
      colors: {
        'val-red': '#FF4655',
        'val-dark': '#111111',
        'val-gray': '#768079',
        'val-light': '#ECE8E1',
        'val-blue': '#0f1923',
      },
    },
  },
  plugins: [],
};
export default config;