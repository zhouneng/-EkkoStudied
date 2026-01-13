
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 关键修复：将 process.env 映射到 window.process.env
    // 这与 index.html 中的 polyfill 配合，防止生产环境报 "process is not defined" 错误
    'process.env': 'window.process.env',
  },
  build: {
    outDir: 'dist',
  },
});
