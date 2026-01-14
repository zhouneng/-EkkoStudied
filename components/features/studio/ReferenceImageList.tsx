/**
 * 文件名: ReferenceImageList.tsx
 * 功能: 参考图片列表组件。
 * 核心逻辑:
 * 1. 横向滚动展示已添加的参考图缩略图。
 * 2. 提供移除和预览参考图的功能。
 * 3. 显示参考图总数量。
 */

import React from 'react';
import { Icons } from '../../common/Icons';
import { ReferenceImage } from '../../../types';

interface ReferenceImageListProps {
    images: ReferenceImage[];
    onRemove: (id: string) => void;
    onPreview: (image: ReferenceImage) => void;
}

export const ReferenceImageList: React.FC<ReferenceImageListProps> = ({ images, onRemove, onPreview }) => {
    if (images.length === 0) return null;

    return (
        <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 custom-scrollbar">
            {images.map((img) => (
                <div
                    key={img.id}
                    className="relative group flex-shrink-0 w-12 h-12 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden cursor-pointer hover:border-orange-500 dark:hover:border-stone-600 transition-colors"
                    onClick={() => onPreview(img)}
                >
                    <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(img.id);
                        }}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 hover:bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="移除"
                    >
                        <Icons.X size={10} />
                    </button>
                </div>
            ))}
            <div className="text-[10px] text-stone-500 dark:text-stone-600 font-medium px-2 select-none">
                {images.length} 张参考图
            </div>
        </div>
    );
};