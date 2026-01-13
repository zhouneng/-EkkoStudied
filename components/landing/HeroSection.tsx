
import React from 'react';
import { Icons } from '../Icons';

interface HeroSectionProps {
  hasKey: boolean;
  onAction: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ hasKey, onAction }) => {
  return (
    <section className="relative z-10 flex flex-col justify-center items-center px-6 pt-32 pb-10 min-h-[60vh]">
      <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-300 text-[10px] font-mono tracking-widest uppercase mb-4 shadow-lg shadow-orange-900/10">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
          EkkoStudied Engine v2.5
        </div>

        {/* Title */}
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-medium tracking-tighter leading-[0.9] text-stone-200">
          Visual Asset <br />
          <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-200 to-orange-400 animate-gradient-x pb-4">
            Cloning
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-4xl mx-auto text-base md:text-lg text-stone-400 font-light leading-relaxed whitespace-normal md:whitespace-nowrap">
          跨越 <span className="text-stone-200 font-medium">像素</span> 与 <span className="text-stone-200 font-medium">帧</span> 的界限。
          搭载 Gemini 多模态引擎，精准还原每一丝光影细节。
        </p>

        {/* Action Button */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={onAction}
            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-sm overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(249,115,22,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-2 group-hover:text-white transition-colors">
              {hasKey ? <Icons.Sparkles size={16} /> : <Icons.ArrowRight size={16} />}
              {hasKey ? '开始复刻 (Start Reverse)' : '立即登录 (Enter Studio)'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
