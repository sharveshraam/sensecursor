/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f6f8ff",
          100: "#dfe8ff",
          200: "#bccffd",
          500: "#5f7df5",
          700: "#2941aa",
          900: "#111936"
        }
      },
      boxShadow: {
        glass: "0 18px 45px rgba(15, 23, 42, 0.16)"
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        pulseFade: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.85" }
        }
      },
      animation: {
        floatIn: "floatIn 0.45s ease-out both",
        pulseFade: "pulseFade 1.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
