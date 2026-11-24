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
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Geist"', 'system-ui', 'sans-serif'],
      },
      colors: {
        dev: {
          bg: '#0b0c0f',
          surface: '#111317',
          surfaceHover: '#161920',
          card: '#111317',
          border: '#232733',
          borderHighlight: '#2f3442',
          green: '#c6ff3d',
          greenDim: '#a5d92f',
          cyan: '#d8d6cc',
          cyanDim: '#b4b2a8',
          amber: '#ffb454',
          red: '#ff5d5d',
          text: '#ecebe6',
          muted: '#8b90a0',
          faint: '#555b6b',
        }
      },
      boxShadow: {
        'glow-green': 'none',
        'glow-cyan': 'none',
        'glow-amber': 'none',
        'terminal': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'blink-slow': 'none',
        'pulse-glow': 'none',
      }
    },
  },
  plugins: [],
}
