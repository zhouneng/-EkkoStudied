/**
 * 文件名: LandingPage.tsx
 * 功能: 落地页组件 (Root级封装)。
 * 核心逻辑:
 * 1. 引用 `components/features/landing` 下的子组件。
 * 2. 组装背景、导航、Hero区域、功能区和页脚。
 * 3. 处理登录模态框的显示逻辑。
 */

import React, { useEffect, useState } from 'react';
import { LandingBackground } from './features/landing/LandingBackground';
import { LandingNavbar } from './features/landing/LandingNavbar';
import { LandingFooter } from './features/landing/LandingFooter';
import { HeroSection } from './features/landing/HeroSection';
import { FeatureBento } from './features/landing/FeatureBento';
import { LoginModal } from './features/landing/LoginModal';

interface LandingPageProps {
  onEnterApp: () => void;
  hasKey: boolean;
  onSelectKey: () => Promise<void>;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, hasKey, onSelectKey }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 修改: 直接打开登录窗口，不再强制检查 key
  const handleMainAction = () => {
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden flex flex-col">
      
      {/* 1. 沉浸式背景层 */}
      <LandingBackground />

      {/* 2. 导航栏 */}
      <LandingNavbar 
        scrolled={scrolled} 
        hasKey={hasKey} 
        onSelectKey={onSelectKey} 
        onEnterApp={() => setIsLoginOpen(true)} 
      />

      {/* 3. 主要内容区 */}
      <main className="relative z-10 flex-1 flex flex-col gap-20">
        <HeroSection onAction={handleMainAction} />
        <FeatureBento />
      </main>

      {/* 4. 页脚 */}
      <LandingFooter />

      {/* 5. 登录模态框 */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={() => {
            setIsLoginOpen(false);
            onEnterApp();
        }}
      />
    </div>
  );
};