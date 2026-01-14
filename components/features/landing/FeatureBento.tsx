/**
 * 文件名: FeatureBento.tsx
 * 功能: 落地页功能特性展示组件 (Bento Grid 风格)。
 * 核心逻辑:
 * 1. 使用 Grid 布局展示三个核心功能卡片：深度逆向、Prompt Lab 和 Sora 解析。
 * 2. 每个卡片包含悬停动画和图标视觉效果。
 */

import React from 'react';
import { Icons } from '../../common/Icons';

export const FeatureBento: React.FC = () => {
  return (
    <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 卡片 1: 深度逆向 */}
        <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all overflow-hidden backdrop-blur-sm h-64 flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 text-orange-500">
                <Icons.Scan size={64} strokeWidth={1} />
            </div>
            <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4">
                    <Icons.Scan size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">深度视觉逆向</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                    从微观材质到宏观构图，物理级还原图像 DNA。
                </p>
            </div>
        </div>

        {/* 卡片 2: Prompt Lab */}
        <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all overflow-hidden backdrop-blur-sm h-64 flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 text-indigo-500">
                <Icons.FlaskConical size={64} strokeWidth={1} />
            </div>
            <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                    <Icons.FlaskConical size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Prompt Lab</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                    版本化管理你的提示词资产，支持多语言自动转译。
                </p>
            </div>
        </div>

        {/* 卡片 3: Sora Ready (宽) */}
        <div className="md:col-span-1 lg:col-span-1 group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all overflow-hidden backdrop-blur-sm h-64 flex flex-col justify-between">
             {/* 视觉图标 */}
             <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 text-emerald-500">
                <Icons.Film size={64} strokeWidth={1} />
             </div>

             <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
             <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                    <Icons.Film size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sora 视频流解析</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                    逐帧解构运镜与动态，生成标准视频 Prompt。
                </p>
             </div>
        </div>

      </div>
    </section>
  );
};