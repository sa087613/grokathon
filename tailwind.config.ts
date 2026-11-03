import type { Config } from 'tailwindcss';

// Keep in step with docs/DESIGN.md.
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    borderRadius: { none: '0', full: '9999px' },
    boxShadow: { none: 'none' },
    extend: {
      colors: {
        paper: '#EEECE4',
        panel: '#E5E2D7',
        ink: '#171614',
        muted: '#67645C',
        line: '#CBC8BD',
        'line-strong': '#A9A69B',
        brick: { DEFAULT: '#BE4A47', deep: '#8E1F1F', soft: '#FBEFEC' },
        link: { DEFAULT: '#1F5FA8', soft: '#D5E2F2' },
        job: { street: '#B3261E', repaving: '#C98A2E', nodig: '#8FB0D6', building: '#8F8C84' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderWidth: { 3: '3px' },
    },
  },
} satisfies Config;
