import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.JPG'], // 讓 Vite 支援 JPG 圖片作為靜態資源
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
