/**
 * 文件名: PanelHeader.tsx
 * 功能: 面板顶部标题栏通用组件。
 * 核心逻辑:
 * 1. 标准化左侧和右侧面板的标题样式。
 * 2. 支持传入自定义图标、标题文本和右侧操作按钮 (children)。
 */

import React from 'react';

interface PanelHeaderProps {
    title: string;
    icon?: React.ReactNode;
    children?: React.ReactNode; // 用于操作按钮或标签页
    className?: string;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
    title,
    icon,
    children,
    className = ''
}) => {
    return (
        <div className={`h-12 min-h-[3rem] px-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between gap-4 flex-shrink-0 select-none transition-colors duration-300 ${className}`}>
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                {icon && <span className="opacity-70">{icon}</span>}
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">{title}</h3>
            </div>
            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    );
};