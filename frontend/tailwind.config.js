/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Geist"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        dev: {
          bg: '#090a0f',
          surface: '#11131a',
          surfaceHover: '#171a24',
          card: '#131620',
          border: '#1f2433',
          borderHighlight: '#2e384d',
          green: '#00ff66',
          greenDim: '#00cc52',
          cyan: '#00f0ff',
          cyanDim: '#00b8c4',
          amber: '#ffb700',
          red: '#ff3366',
          text: '#e2e8f0',
          muted: '#64748b',
          faint: '#334155',
        }
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(0, 255, 102, 0.25)',
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.25)',
        'glow-amber': '0 0 15px rgba(255, 183, 0, 0.25)',
        'terminal': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 4px #00ff66)' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 10px #00ff66)' },
        }
      },
      animation: {
        'blink-slow': 'blink 1.2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
