/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./composants/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0056b3",
        secondary: "#ffc107",
        success: "#28a745",
        warning: "#ffc107",
        danger: "#dc3545",
        background: "#f5f7fa",
        black: "#1c1c1c",
        white: "#ffffff",
        highlight: "rgba(255, 255, 0, 0.2)", // Pour des effets de surbrillance
        gradientStart: "#0056b3",
        gradientEnd: "#ffc107",
        darkBackground: "#1c1c1c", // Pour le mode sombre
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        display: ["Oswald", "sans-serif"], // Pour des titres accrocheurs
        handwriting: ["Pacifico", "cursive"], // Pour des éléments uniques
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-100px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.9", boxShadow: "0 0 10px rgba(0, 86, 179, 0.8)" },
          "50%": { opacity: "1", boxShadow: "0 0 20px rgba(0, 86, 179, 1)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        fadeIn: "fadeIn 1s ease-in",
        slideInLeft: "slideInLeft 0.8s ease-out",
        spin: "spin 1s linear infinite",
        pulseGlow: "pulseGlow 1.5s infinite",
        bounceIn: "bounceIn 0.8s ease-out",
        gradientShift: "gradientShift 4s ease infinite",
      },
      backgroundImage: {
        'gradient-radial': "radial-gradient(circle, var(--tw-gradient-stops))",
        'gradient-conic': "conic-gradient(from 0deg, var(--tw-gradient-stops))",
        'hero-pattern': "url('/img/hero-pattern.svg')", // Exemple pour un fond personnalisé
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 86, 179, 0.8)", // Effet lumineux
        deep: "0 10px 15px rgba(0, 0, 0, 0.3)", // Ombre profonde
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Pour styliser les formulaires
    require('@tailwindcss/typography'), // Pour un meilleur rendu typographique
    require('@tailwindcss/aspect-ratio'), // Pour les vidéos ou images responsives
  ],
};