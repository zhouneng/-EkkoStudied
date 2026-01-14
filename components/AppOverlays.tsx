/**
 * 文件名: AppOverlays.tsx
 * 功能: 应用程序全局覆盖层管理组件。
 * 核心逻辑:
 * 1. 集中渲染所有模态框 (Modals) 和全屏覆盖层 (Toast, Help, ApiKey, PromptLab)。
 * 2. 处理图片全屏查看和全屏对比功能。
 * 3. 避免在主 App 组件中堆积过多的 Modal 代码。
 */

import React from 'react';
import { ToastContainer, ToastMessage, ToastType } from './ToastContainer';
import { DocumentationModal } from './DocumentationModal';
import { ApiKeyModal } from './ApiKeyModal';
import { PromptLabModal } from './PromptLabModal';
import { Icons } from './Icons';

interface AppOverlaysProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  isKeyModalOpen: boolean;
  setIsKeyModalOpen: (open: boolean) => void;
  isPromptLabOpen: boolean;
  setIsPromptLabOpen: (open: boolean) => void;
  fullscreenImg: string | null;
  setFullscreenImg: (img: string | null) => void;
  isFullscreenComparison: boolean;
  setIsFullscreenComparison: (isComparison: boolean) => void;
  displayImage: string | null;
  generatedImage: string | null;
}

export const AppOverlays: React.FC<AppOverlaysProps> = ({
  toasts,
  removeToast,
  isHelpOpen,
  setIsHelpOpen,
  isKeyModalOpen,
  setIsKeyModalOpen,
  isPromptLabOpen,
  setIsPromptLabOpen,
  fullscreenImg,
  setFullscreenImg,
  isFullscreenComparison,
  setIsFullscreenComparison,
  displayImage,
  generatedImage
}) => {
  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <DocumentationModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
      <PromptLabModal isOpen={isPromptLabOpen} onClose={() => setIsPromptLabOpen(false)} />

      {/* 全屏覆盖层 */}
      {fullscreenImg && (
        <div className="fixed inset-0 z-[200] bg-white/95 dark:bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => { setFullscreenImg(null); setIsFullscreenComparison(false); }}>
          <button onClick={(e) => { e.stopPropagation(); setFullscreenImg(null); setIsFullscreenComparison(false); }} className="absolute top-10 right-10 p-4"><Icons.X size={32} /></button>
          {isFullscreenComparison ? (
             <div className="w-full h-full flex items-center justify-center gap-8 p-20">
               <img src={displayImage || ''} className="max-w-[45%] max-h-[85vh] object-contain" alt="Original" />
               <img src={`data:image/png;base64,${generatedImage}`} className="max-w-[45%] max-h-[85vh] object-contain" alt="Generated" />
             </div>
          ) : (
             <div className="w-full h-full flex items-center justify-center p-10">
               <img src={fullscreenImg} className="max-w-[95%] max-h-[95%] object-contain" alt="Fullscreen" />
             </div>
          )}
        </div>
      )}
    </>
  );
};