/**
 * 文件名: StorageIndicator.tsx
 * 功能: LocalStorage 使用量指示器。
 * 核心逻辑:
 * 1. 计算 LocalStorage 当前已用空间和总容量（估算值）。
 * 2. 周期性更新使用率。
 * 3. 当使用量过高时改变颜色警告，并显示详细信息 Tooltip。
 */

import React, { useState, useEffect } from 'react';

export const StorageIndicator: React.FC = () => {
    const [usage, setUsage] = useState({ used: 0, total: 5 * 1024 * 1024, percent: 0 }); // 假设 5MB 限制
    const [isHovered, setIsHovered] = useState(false);

    const calculateUsage = () => {
        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += (localStorage[key].length + key.length) * 2; // 估算字符大小 (UTF-16 为 2 字节)
            }
        }
        
        let simpleTotal = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                simpleTotal += localStorage[key].length + key.length;
            }
        }

        const LIMIT = 5 * 1024 * 1024; // 5 Million characters
        const percent = Math.min(100, (simpleTotal / LIMIT) * 100);

        setUsage({
            used: simpleTotal,
            total: LIMIT,
            percent
        });
    };

    useEffect(() => {
        calculateUsage();
        // 每 2 秒重新计算一次
        const interval = setInterval(calculateUsage, 2000);
        return () => clearInterval(interval);
    }, []);

    const getColor = (p: number) => {
        if (p > 90) return 'bg-red-500';
        if (p > 70) return 'bg-orange-500';
        return 'bg-emerald-500';
    };

    return (
        <div
            className="flex items-center gap-2 px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/50 dark:hover:bg-stone-800 transition-colors cursor-help relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-col gap-0.5 w-24">
                <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-400 font-mono leading-none">
                    <span>STORAGE</span>
                    <span>{usage.percent.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-stone-300 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${getColor(usage.percent)}`}
                        style={{ width: `${usage.percent}%` }}
                    />
                </div>
            </div>

            {/* 工具提示 */}
            <div className={`absolute top-full right-0 mt-2 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded shadow-xl z-50 text-xs text-stone-600 dark:text-stone-300 w-48 pointer-events-none transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex justify-between mb-1">
                    <span>Used:</span>
                    <span className="font-mono text-stone-900 dark:text-white">{(usage.used / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Limit (Est):</span>
                    <span className="font-mono text-stone-900 dark:text-white">5.00 MB</span>
                </div>
                <p className="text-[10px] text-stone-500 leading-tight">
                    *Browser LocalStorage is limited. Clear history to free up space.
                </p>
            </div>
        </div>
    );
};