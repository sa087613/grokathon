import type { Config } from 'tailwindcss';

// Values live as CSS variables in src/app/globals.css. Keep in step with docs/DESIGN.md.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    borderRadius: { none: '0', full: '9999px' },
    boxShadow: { none: 'none' },
    extend: {
      colors: {
        paper: v('paper'),
        panel: v('panel'),
        raise: v('raise'),
        ink: v('ink'),
        muted: v('muted'),
        line: v('line'),
        'line-strong': v('line-strong'),
        accent: v('accent'),
        brick: { DEFAULT: v('coral'), soft: v('coral-soft') },
        link: { DEFAULT: v('link'), soft: v('link-soft') },
        job: { street: v('coral'), repaving: v('amber'), nodig: v('link'), building: v('muted') },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
} satisfies Config;
