
/** @type {import('tailwindcss').Config} */
export default {
  // darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // theme: {
  //   extend: {
  //     colors: {
  //       brand: {
  //         primary: '#3b82f6',   // Blue-500
  //         secondary: '#6366f1', // Indigo-500
  //         accent: '#8b5cf6',    // Violet-500
  //         success: '#22c55e',
  //         warning: '#f59e0b',
  //         danger: '#ef4444',
  //       },
  //       dark: {
  //         bg: '#0f172a',        // Slate-900
  //         card: '#1e293b',      // Slate-800
  //         border: '#334155',    // Slate-700
  //       }
  //     },
  //     animation: {
  //       'fade-in': 'fadeIn 0.5s ease-out',
  //       'slide-up': 'slideUp 0.4s ease-out',
  //       'subtle-fade': 'fadeIn 0.5s ease-in-out',
  //     },
  //     keyframes: {
  //       fadeIn: {
  //         '0%': { opacity: '0' },
  //         '100%': { opacity: '1' },
  //       },
  //       slideUp: {
  //         '0%': { transform: 'translateY(10px)', opacity: '0' },
  //         '100%': { transform: 'translateY(0)', opacity: '1' },
  //       },
  //     },
  //     borderRadius: {
  //       'xl': '1rem',
  //       '2xl': '1.5rem',
  //     }
  //   },
  // },
  
  plugins: [
    // require("tailwindcss-animate"),
    // require('@tailwindcss/forms'), 
    // require('@tailwindcss/typography'),
  ],
}

