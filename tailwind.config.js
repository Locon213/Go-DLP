/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
    "./build/**/*.{html,js,ts,jsx,tsx}", // Добавлен путь к build директории для Wails
  ],
  theme: {
    extend: {
      // Добавляем дополнительные цвета для более минималистичного дизайна
      colors: {
        'dark-bg': '#0f172a', // slate-900
        'dark-card': '#1e293b', // slate-800
        'dark-border': '#334155', // slate-700
        'dark-text': '#f1f5f9', // slate-100
      },
      boxShadow: {
        'minimal': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}