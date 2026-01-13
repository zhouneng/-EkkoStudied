
import React from 'react';
import { Icons } from './Icons';
import { StorageIndicator } from './StorageIndicator';
import { PipelineProgress } from '../types';

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 h-16 flex items-center justify-between px-10 transition-colors duration-300">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onLogoClick}>
        <span className="font-serif font-bold text-xl tracking-tight text-stone-800 dark:text-stone-200">
          EkkoStudied <span className="text-orange-500 text-sm align-top">PRO</span>
        </span>
      </div>

      {/* Global Progress Bar */}
      {pipelineProgress?.isRunning && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 z-50 transition-all duration-300"
          style={{ width: `${pipelineProgress.totalProgress}%` }}
        />
      )}

      <div className="flex items-center gap-2">
        <StorageIndicator />
        <button 
          onClick={() => setIsPromptLabOpen(true)} 
          className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-amber-500 transition-all" 
          title="Prompt Lab"
        >
          <Icons.Wand2 size={20} />
        </button>
        <button 
          onClick={() => setIsHelpOpen(true)} 
          className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-orange-500 transition-all" 
          title="帮助文档"
        >
          <Icons.Help size={20} />
        </button>
        <button 
          onClick={onHistoryClick} 
          className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all" 
          title="历史记录"
        >
          <Icons.History size={20} />
        </button>
        <button
          onClick={onToggleSound}
          className={`p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all ${soundEnabled ? 'text-blue-500' : 'text-stone-500'}`}
          title={soundEnabled ? '音效已启用' : '音效已关闭'}
        >
          {soundEnabled ? <Icons.Volume2 size={20} /> : <Icons.VolumeX size={20} />}
        </button>
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all"
          title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
        >
          {theme === 'light' ? <Icons.Moon size={20} /> : <Icons.Sun size={20} />}
        </button>
        <div className="w-px h-6 bg-stone-200 dark:bg-stone-800 mx-1" />
        <div className="flex items-center gap-2 mr-2">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${apiMode === 'official' ? 'border-orange-500/30 text-orange-600 dark:text-orange-500' : 'border-blue-500/30 text-blue-600 dark:text-blue-500'}`}>
            {apiMode === 'official' ? 'OFFICIAL' : 'CUSTOM'}
          </span>
        </div>
        <button 
          onClick={onSelectKey} 
          className={`p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 ${hasKey ? 'text-emerald-500' : 'text-stone-400'}`} 
          title="API Key 状态"
        >
          <Icons.Key size={20} />
        </button>
      </div>
    </nav>
  );
};
