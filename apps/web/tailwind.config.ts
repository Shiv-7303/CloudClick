import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base':      '#080808',
        'bg-surface':   '#0F0F0F',
        'bg-elevated':  '#161616',
        'bg-overlay':   '#1C1C1C',
        'border-sub':   '#1F1F1F',
        'border-def':   '#2A2A2A',
        'border-str':   '#3D3D3D',
        'accent':       '#F5A623',
        'accent-dim':   '#A87018',
        'text-p':       '#F5F5F0',
        'text-s':       '#8C8C8C',
        'text-m':       '#4A4A4A',
        'positive':     '#22C55E',
        'negative':     '#EF4444',
      },
      fontFamily: {
        display: ['Instrument Serif', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-amber': '0 0 40px rgba(245,166,35,0.12), 0 0 80px rgba(245,166,35,0.06)',
        'focus-amber': '0 0 0 2px rgba(245,166,35,0.4)',
      }
    },
  },
  plugins: [],
}
export default config