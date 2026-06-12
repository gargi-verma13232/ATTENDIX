/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appBg: "#0B0D1B",       
        cardBg: "#161933",      
        accentPurple: "#7C3AED",
        accentBlue: "#3B82F6",  
        statusSafe: "#10B981",  
        statusWarn: "#F59E0B",  
        statusCrit: "#EF4444",  
      },
    },
  },
  plugins: [],
}