/**
 * 文件名: StorageIndicator.tsx
 * 功能: 基于 IndexedDB 的专业级存储监控组件 (最终优化版)
 * 核心逻辑:
 * 1. 事件驱动: 仅在历史记录变化时更新，告别高能耗的轮询。
 * 2. 交互清理: 集成一键清理功能，带二次确认弹窗。
 * 3. 动态视觉: 根据配额自动变色 (绿/橙/红) 并具备高压闪烁提醒。
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getHistory, clearAllHistory } from '../../services/historyService';

interface StorageStats {
    itemCount: number;
    usedBytes: number;
    quotaBytes: number | null;
    percent: number;
}

const INITIAL_STATS: StorageStats = {
    itemCount: 0,
    usedBytes: 0,
    quotaBytes: null,
    percent: 0
};

export const StorageIndicator: React.FC = () => {
    const [stats, setStats] = useState<StorageStats>(INITIAL_STATS);
    const [isHovered, setIsHovered] = useState(false);

    // 格式化字节显示
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // 核心计算逻辑
    const refreshStorageStats = useCallback(async () => {
        try {
            const history = await getHistory();
            let usedBytes = 0;
            let quotaBytes: number | null = null;
            let percent = 0;

            // 1. 统计业务数据大小
            history.forEach(item => {
                if (item.originalImage) usedBytes += item.originalImage.length;
                if (item.generatedImage) usedBytes += item.generatedImage.length;
                if (item.prompt) usedBytes += item.prompt.length * 2;
            });

            // 2. 获取浏览器系统配额
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                if (estimate.quota) {
                    quotaBytes = estimate.quota;
                    // 优先使用系统报告的 usage
                    const actualUsage = estimate.usage || usedBytes;
                    percent = (actualUsage / estimate.quota) * 100;
                    usedBytes = actualUsage;
                }
            }

            setStats({
                itemCount: history.length,
                usedBytes,
                quotaBytes,
                percent: Math.min(100, percent)
            });
        } catch (e) {
            console.error('存储状态更新失败:', e);
        }
    }, []);

    // 处理一键清理
    const handleClear = async () => {
        if (window.confirm('确定要清空所有历史记录和本地图片吗？此操作不可撤销。')) {
            await clearAllHistory();
            // 触发全局自定义事件，通知其他组件更新
            // 注意：refreshStorageStats 会通过事件监听自动触发，但手动调用可确保即时性
            await refreshStorageStats(); 
        }
    };

    useEffect(() => {
        refreshStorageStats();

        // 优化点：使用自定义事件监听，而不是 setInterval 轮询
        window.addEventListener('history-updated', refreshStorageStats);
        // 同时也监听原生存储事件
        window.addEventListener('storage', refreshStorageStats);
        
        return () => {
            window.removeEventListener('history-updated', refreshStorageStats);
            window.removeEventListener('storage', refreshStorageStats);
        };
    }, [refreshStorageStats]);

    const getStatusColor = () => {
        if (stats.percent > 90) return 'text-red-500 bg-red-500';
        if (stats.percent > 70) return 'text-orange-500 bg-orange-500';
        return 'text-emerald-500 bg-emerald-500';
    };

    const colorClasses = getStatusColor().split(' ');

    return (
        <div
            className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 transition-all hover:border-stone-400 cursor-help relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 主显示区 */}
            <div className="flex items-center gap-2 text-[11px] font-mono font-medium">
                <span className="text-stone-400">存储占用</span>
                <span className={`${colorClasses[0]} ${stats.percent > 85 ? 'animate-pulse' : ''}`}>
                    {stats.percent.toFixed(1)}%
                </span>
                <span className="text-stone-300 dark:text-stone-700">|</span>
                <span className="text-stone-600 dark:text-stone-400">{stats.itemCount} 张图片</span>
            </div>

            {/* 迷你进度条 */}
            <div className="w-12 h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden hidden sm:block">
                <div 
                    className={`h-full transition-all duration-1000 ${colorClasses[1]}`} 
                    style={{ width: `${stats.percent}%` }}
                />
            </div>

            {/* 增强型 Tooltip - 样式优化版: 向下弹出 (top-full), z-[100], visible/invisible 控制 */}
            <div className={`
                absolute top-full right-0 mt-3 
                p-4 bg-white dark:bg-stone-950 
                border border-stone-200 dark:border-stone-800 
                rounded-xl shadow-2xl z-[100] w-60 
                transform origin-top-right transition-all duration-200 ease-in-out
                ${isHovered ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
            `}>
                <h4 className="text-xs font-bold mb-3 border-b border-stone-100 dark:border-stone-900 pb-2 text-stone-700 dark:text-stone-300">本地存储详情</h4>
                
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-stone-500">已存图片:</span>
                        <span className="font-mono text-stone-900 dark:text-white">{stats.itemCount} 张</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-stone-500">已用空间:</span>
                        <span className="font-mono text-stone-900 dark:text-white">{formatBytes(stats.usedBytes)}</span>
                    </div>
                    {stats.quotaBytes && (
                        <div className="flex justify-between">
                            <span className="text-stone-500">剩余配额:</span>
                            <span className="font-mono text-stone-900 dark:text-white">{formatBytes(stats.quotaBytes - stats.usedBytes)}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleClear}
                    className="w-full mt-4 py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50"
                >
                    清空历史并释放空间
                </button>

                <p className="text-[10px] text-stone-400 leading-tight mt-3 italic">
                    * 存储于浏览器 IndexedDB，受系统配额保护。建议定期清理。
                </p>
            </div>
        </div>
    );
};