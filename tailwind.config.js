/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        night: '#09080f',
        ink: '#131220',
        glow: '#90f7b8',
        lilac: '#7f5cf4',
        mist: '#d9d6f8'
      },
      boxShadow: {
        halo: '0 20px 80px rgba(127, 92, 244, 0.24)'
      },
      backgroundImage: {
        aurora:
          'radial-gradient(circle at 20% 20%, rgba(127, 92, 244, 0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(46, 182, 125, 0.24), transparent 42%), linear-gradient(160deg, #050509 0%, #0f0d1b 45%, #050509 100%)'
      }
    }
  },
  plugins: []
};
