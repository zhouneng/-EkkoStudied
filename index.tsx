/**
 * 文件名: index.tsx
 * 功能: 前端应用入口文件。
 * 核心逻辑:
 * 1. 检查 DOM 根节点。
 * 2. 初始化 React Root。
 * 3. 挂载 App 组件并开启严格模式。
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);