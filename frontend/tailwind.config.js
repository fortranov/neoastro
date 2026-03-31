/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: "#0f0a1e",
          "bg-2": "#1a1035",
          "bg-3": "#241850",
          gold: "#d4af37",
          "gold-light": "#f0d060",
          purple: "#7c3aed",
          "purple-light": "#a855f7",
          "purple-dark": "#4c1d95",
          muted: "#6b7280",
        },
      },
      backgroundImage: {
        "cosmic-gradient": "linear-gradient(135deg, #0f0a1e 0%, #1a1035 50%, #0f0a1e 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        "card-flip": "cardFlip 0.6s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        cardFlip: {
          "0%": { transform: "rotateY(90deg)", opacity: "0" },
          "100%": { transform: "rotateY(0deg)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
