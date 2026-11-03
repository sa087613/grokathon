import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2B2926',
        muted: '#77716A',
        line: '#E8E3DC',
        paper: '#FBFAF7',
        peach: { DEFAULT: '#D98B5F', soft: '#F8E8DC', deep: '#A85F38' },
      },
      fontFamily: {
        serif: ['ui-serif', 'Georgia', 'Cambria', 'serif'],
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
} satisfies Config;
