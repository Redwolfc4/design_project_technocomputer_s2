const fg = require('fast-glob');
const fs = require('fs');

const files = fg.sync(['src/**/*.{js,ts,jsx,tsx,mdx}']);
const rawContent = files.map((f) => ({
  raw: fs.readFileSync(f, 'utf-8'),
  extension: f.endsWith('.tsx') ? 'tsx' : 'ts',
}));

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: rawContent,
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
        },
        success: {
          DEFAULT: '#059669',
          light: '#ECFDF5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
        },
        error: {
          DEFAULT: '#E11D48',
          light: '#FFF1F2',
        },
      },
    },
  },
  plugins: [],
};
