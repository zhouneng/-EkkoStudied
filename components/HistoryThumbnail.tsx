/**
 * 文件名: HistoryThumbnail.tsx
 * 功能: 历史记录缩略图组件。
 * 核心逻辑:
 * 1. 显示单张历史图片的缩略图。
 * 2. 处理选中、悬停、删除和下载操作。
 * 3. 根据激活状态应用高亮边框样式。
 */

import React from 'react';
import { Icons } from './Icons';

interface HistoryThumbnailProps {
  imageUrl: string;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onDownloadHD?: () => void;
}

export const HistoryThumbnail: React.FC<HistoryThumbnailProps> = ({
  imageUrl,
  index,
  isActive,
  onClick,
  onDelete,
  onDownloadHD,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const handleDownloadHD = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownloadHD?.();
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative w-full h-full rounded-lg overflow-hidden border-2 cursor-pointer
        transition-all duration-200 group
        ${isActive
          ? 'border-orange-500 dark:border-white opacity-100 ring-2 ring-orange-500/20 dark:ring-white/10'
          : 'border-transparent hover:border-stone-300 dark:hover:border-stone-700 opacity-70 hover:opacity-100'
        }
      `}
    >
      <img
        src={imageUrl}
        alt={`Generated ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-200"
      />

      {/* 删除按钮 - 悬停时显示 */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-black/60 hover:bg-rose-500 text-stone-600 dark:text-white hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
          title="删除此记录"
        >
          <Icons.X size={10} />
        </button>
      )}
    </div>
  );
};