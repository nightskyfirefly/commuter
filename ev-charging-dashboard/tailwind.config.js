module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'aurora-blue': '#030c18',
        'aurora-dark': '#0a1a2e',
        'aurora-darker': '#16213e',
        'aurora-sidebar': '#0b1a2a',
        'aurora-border': '#1b3a5a',
        'aurora-text': '#dbe7ff',
        'aurora-muted': '#8fa3b8',
        'aurora-accent': '#ffd700',
        'aurora-orange': '#ff6b35',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
