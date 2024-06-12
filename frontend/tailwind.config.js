/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'node_modules/@fontawesome/fontawesome-free/**/*.js',
    './src/**/*.{html,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        'dot': ['DotGothic16', 'sans-serif'],
      },
    },
  },
}
