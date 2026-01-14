/**
 * 文件名: LandingFooter.tsx
 * 功能: 落地页页脚组件。
 * 核心逻辑:
 * 1. 显示版权信息。
 * 2. 简单的底部布局。
 */

import React from 'react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="relative z-20 py-12 border-t border-white/5 bg-[#0A0A0A] text-center">
      <p className="text-stone-600 text-xs font-mono">
        © 2026 EkkoStudied. Powered by Google Gemini 2.5 & 3 PRO.
      </p>
    </footer>
  );
};