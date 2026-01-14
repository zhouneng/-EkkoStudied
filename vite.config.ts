/**
 * 文件名: vite.config.ts
 * 功能: Vite 项目配置文件。
 * 核心逻辑:
 * 1. 配置 React 插件。
 * 2. 设置路径别名 (@)。
 * 3. 定义全局环境变量 polyfill (process.env)。
 * 4. 配置构建输出目录。
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd()),
    },
  },
  define: {
    'process.env': 'window.process.env',
  },
  build: {
    outDir: 'dist',
  },
});