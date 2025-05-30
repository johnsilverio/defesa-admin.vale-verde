/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': 'var(--primary-green)',
        'dark-green': 'var(--dark-green)',
        'light-green': 'var(--light-green)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
        },
      },
      fontSize: {
        '2xs': '0.65rem',
      },
    },
  },
  plugins: [],
}; 