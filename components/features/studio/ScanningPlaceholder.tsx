/**
 * 文件名: ScanningPlaceholder.tsx
 * 功能: 图片扫描分析时的占位动画。
 */

import React from 'react';
import { Icons } from '../../common/Icons';

export const ScanningPlaceholder: React.FC = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none bg-black/20 backdrop-blur-[1px]">
    <div className="relative">
      <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
      <Icons.Scan size={48} className="text-orange-500 animate-pulse relative z-10" />
    </div>
    <p className="text-orange-400 text-xs font-mono mt-4 tracking-widest animate-pulse font-bold">
      ANALYZING PIXELS...
    </p>
    {/* Scanning Line Animation */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/80 to-transparent shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
    <style>{`
      @keyframes scan {
        0% { top: 0%; opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
    `}</style>
  </div>
);