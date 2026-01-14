import React from 'react';
import { Icons } from '../common/Icons';
import { StorageIndicator } from '../common/StorageIndicator';
import { SettingsMenu } from './SettingsMenu'; // 引入新组件
import { PipelineProgress } from '../../types';

interface AppHeaderProps {
  pipelineProgress: PipelineProgress | null;
  setIsPromptLabOpen: (open: boolean) => void;
  setIsHelpOpen: (open: boolean) => void;
  onHistoryClick: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  apiMode: 'official' | 'custom';
  hasKey: boolean;
  onSelectKey: () => void;
  onLogoClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  pipelineProgress,
  setIsPromptLabOpen,
  setIsHelpOpen,
  onHistoryClick,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
  apiMode,
  hasKey,
  onSelectKey,
  onLogoClick
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 h-16 flex items-center justify-between px-6 transition-colors duration-300">
      
      {/* 1. 左侧 Logo */}
      <div className="flex items-center gap-3 cursor-pointer group" onClick={onLogoClick}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-stone-800 to-black dark:from-white dark:to-stone-300 flex items-center justify-center text-white dark:text-black font-bold font-serif text-lg shadow-lg group-hover:scale-105 transition-transform">
          E
        </div>
        <span className="font-serif font-bold text-xl tracking-tight text-stone-800 dark:text-stone-200">
          Ekko<span className="text-stone-400">Studied</span>
        </span>
      </div>

      {/* 全局进度条 */}
      {pipelineProgress?.isRunning && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 z-50 transition-all duration-300 animate-pulse"
          style={{ width: `${pipelineProgress.totalProgress}%` }}
        />
      )}

      {/* 2. 右侧功能区 */}
      <div className="flex items-center gap-3">
        
        {/* 存储指示器 (保留在外面) */}
        <StorageIndicator />

        <div className="w-px h-5 bg-stone-200 dark:bg-stone-800 mx-1" />

        {/* 魔法棒 (Prompt Lab) */}
        <button 
          onClick={() => setIsPromptLabOpen(true)} 
          className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-amber-500 transition-all" 
          title="Prompt Lab"
        >
          <Icons.Wand2 size={20} />
        </button>

        {/* 历史记录 (保留在外面，常用) */}
        <button 
          onClick={onHistoryClick} 
          className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all" 
          title="历史记录"
        >
          <Icons.History size={20} />
        </button>

        {/* 主题切换 (保留在外面，或根据喜好放入菜单) */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all"
          title="切换主题"
        >
          {theme === 'light' ? <Icons.Moon size={20} /> : <Icons.Sun size={20} />}
        </button>

        <div className="w-px h-5 bg-stone-200 dark:bg-stone-800 mx-1" />

        {/* Custom 标签 */}
        <div className="flex items-center">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
            apiMode === 'official' 
              ? 'border-orange-500/30 text-orange-600 dark:text-orange-500 bg-orange-500/5' 
              : 'border-blue-500/30 text-blue-600 dark:text-blue-500 bg-blue-500/5'
          }`}>
            {apiMode === 'official' ? 'OFFICIAL' : 'CUSTOM'}
          </span>
        </div>

        {/* 3. 新的设置菜单 (收纳了其余功能) */}
        <SettingsMenu 
          onOpenHelp={() => setIsHelpOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          hasKey={hasKey}
          onSelectKey={onSelectKey}
          apiMode={apiMode}
        />

      </div>
    </nav>
  );
};