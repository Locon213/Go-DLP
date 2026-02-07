import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Принудительно локалхост (IPv4)
    port: 5173,        // Фиксируем порт
    strictPort: true,  // Если занят - упасть, а не менять порт
  },
  build: {
    // Важно для Wails, чтобы пути были относительные
    outDir: './dist', // Папка вывода для билда - должно соответствовать go:embed
    emptyOutDir: true, // Очищаем перед каждым билдом
    assetsDir: '.',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  root: './frontend', // Указываем, что корень проекта - папка frontend
  publicDir: './public' // Папка с публичными файлами
})