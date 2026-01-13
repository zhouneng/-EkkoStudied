
import React, { useEffect, useState } from 'react';
import { LandingBackground } from './landing/LandingBackground';
import { LandingNavbar } from './landing/LandingNavbar';
import { LandingFooter } from './landing/LandingFooter';
import { HeroSection } from './landing/HeroSection';
import { FeatureBento } from './landing/FeatureBento';
import { LoginModal } from './landing/LoginModal';

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
      
      {/* 1. Immersive Background Layer */}
      <LandingBackground />

      {/* 2. Navigation */}
      <LandingNavbar 
        scrolled={scrolled} 
        hasKey={hasKey} 
        onSelectKey={onSelectKey} 
        onEnterApp={() => setIsLoginOpen(true)} 
      />

      {/* 3. Main Content Content */}
      <main className="relative z-10 flex-1 flex flex-col gap-20">
        <HeroSection onAction={handleMainAction} />
        <FeatureBento />
      </main>

      {/* 4. Footer */}
      <LandingFooter />

      {/* 5. Login Modal */}
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
