/**
 * 文件名: LandingPage.tsx
 * 功能: 落地页 (Landing Page) 主容器组件。
 * 核心逻辑:
 * 1. 组合所有落地页子组件 (背景、导航、Hero、功能区、页脚)。
 * 2. 监听窗口滚动事件以调整导航栏样式。
 * 3. 管理登录弹窗 (LoginModal) 的显示状态。
 */

import React, { useEffect, useState } from 'react';
import { LandingBackground } from './LandingBackground';
import { LandingNavbar } from './LandingNavbar';
import { LandingFooter } from './LandingFooter';
import { HeroSection } from './HeroSection';
import { FeatureBento } from './FeatureBento';
import { LoginModal } from '../../modals/LoginModal';

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

  // 修改点：彻底删除 hasKey 判断，强制直接打开登录弹窗
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

      {/* 5. 登录弹窗 */}
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