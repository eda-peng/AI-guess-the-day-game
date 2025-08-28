import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/AI-guess-the-day-game/', // 請確認這是您的 GitHub 儲存庫名稱
  build: {
    outDir: 'dist'
  }
});
