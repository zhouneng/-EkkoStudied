/**
 * 文件名: SettingsMenu.tsx
 * 功能: 顶部导航栏的设置下拉菜单 (齿轮图标)
 * 收纳了: 语言切换、音效开关、帮助文档、API Key 状态
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../common/Icons';

interface SettingsMenuProps {
  // 接收从 AppHeader 传来的控制方法
  onOpenHelp: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hasKey: boolean;
  onSelectKey: () => void;
  apiMode: 'official' | 'custom';
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  onOpenHelp, 
  soundEnabled, 
  onToggleSound, 
  hasKey, 
  onSelectKey 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'CN' | 'EN'>('CN'); // 暂时在组件内管理语言状态
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* 1. 齿轮触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-full transition-all duration-200 ${
          isOpen 
            ? 'bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-white' 
            : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200'
        }`}
        title="设置"
      >
        <Icons.Settings size={20} />
      </button>

      {/* 2. 下拉菜单面板 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <div className="py-1.5">
            
            {/* 语言切换 (模拟) */}
            <button
              onClick={() => setLanguage(l => l === 'CN' ? 'EN' : 'CN')}
              className="w-full px-4 py-2.5 text-left text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Icons.Languages size={16} className="text-stone-400 group-hover:text-stone-500 dark:group-hover:text-stone-300" />
                <span>语言 / Language</span>
              </div>
              <span className="text-[10px] font-bold bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-500 border border-stone-200 dark:border-stone-700">
                {language}
              </span>
            </button>

            {/* 音效开关 */}
            <button
              onClick={onToggleSound}
              className="w-full px-4 py-2.5 text-left text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Icons.Volume2 size={16} className="text-stone-400 group-hover:text-stone-500 dark:group-hover:text-stone-300" />
                ) : (
                  <Icons.VolumeX size={16} className="text-stone-400 group-hover:text-stone-500 dark:group-hover:text-stone-300" />
                )}
                <span>音效反馈</span>
              </div>
              {/* 仿 iOS 开关 */}
              <div className={`w-8 h-4.5 rounded-full relative transition-colors duration-200 ${soundEnabled ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700'}`}>
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${soundEnabled ? 'left-[1.1rem]' : 'left-0.5'}`} />
              </div>
            </button>

            <div className="h-px bg-stone-100 dark:bg-stone-800 my-1" />

            {/* 帮助文档 */}
            <button
              onClick={() => { onOpenHelp(); setIsOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-3 group"
            >
              <Icons.Help size={16} className="text-stone-400 group-hover:text-stone-500 dark:group-hover:text-stone-300" />
              <span>帮助文档</span>
            </button>

            <div className="h-px bg-stone-100 dark:bg-stone-800 my-1" />

            {/* API Key 状态 */}
            <button
              onClick={() => { onSelectKey(); setIsOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Icons.Key size={16} className={`group-hover:text-stone-500 dark:group-hover:text-stone-300 ${hasKey ? 'text-emerald-500' : 'text-stone-400'}`} />
                <span>API Key 状态</span>
              </div>
              {hasKey && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
            </button>

          </div>
        </div>
      )}
    </div>
  );
};