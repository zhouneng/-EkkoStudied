/**
 * 文件名: LandingNavbar.tsx
 * 功能: 落地页导航栏组件。
 * 核心逻辑:
 * 1. 响应滚动事件，改变背景透明度和模糊效果。
 * 2. 提供 "API Key" 配置入口和 "进入工作室" 按钮。
 * 3. 适配移动端和桌面端布局。
 */

import React from 'react';
import { Icons } from '../../common/Icons';

interface LandingNavbarProps {
  scrolled: boolean;
  hasKey: boolean;
  onSelectKey: () => Promise<void>;
  onEnterApp: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ scrolled, hasKey, onSelectKey, onEnterApp }) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#050505]/90 backdrop-blur-xl py-2 shadow-2xl shadow-black/50' : 'bg-transparent py-4'}`}>
      <div className="max-w-[1440px] mx-auto px-10 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <Icons.Compass size={20} />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-white">EkkoStudied</span>
        </div>
        
        <div className="flex items-center gap-4">
          {!hasKey && (
            <button
              onClick={onSelectKey}
              className="hidden md:flex px-4 py-1.5 border border-orange-500/30 text-orange-400 text-[10px] font-bold rounded-full hover:bg-orange-500/10 transition-all items-center gap-2"
            >
              <Icons.Key size={12} /> API KEY
            </button>
          )}
          <button
            onClick={hasKey ? onEnterApp : onSelectKey}
            className="px-5 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-orange-400 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2"
          >
            {hasKey ? 'Enter Studio' : 'Configure'} <Icons.ChevronRight size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
};