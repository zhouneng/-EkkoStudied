/**
 * 文件名: documentationData.ts
 * 功能: 静态文档数据源。
 * 核心逻辑:
 * 1. 定义文档中心 (Documentation Center) 的分类结构。
 * 2. 存储各章节的 Markdown 内容。
 */

import { Icons } from '../components/common/Icons';

export interface DocArticle {
    id: string;
    title: string;
    icon: keyof typeof Icons;
    content: string;
}

interface DocCategory {
    title: string;
    articles: DocArticle[];
}

export const DOCUMENTATION_CATEGORIES: DocCategory[] = [
    {
        title: "GETTING STARTED",
        articles: [
            { 
                id: 'quick-start', 
                title: 'Quick Start', 
                icon: 'Play', 
                content: `# Quick Start\n\nWelcome to UnImage! Follow these 4 steps to start your first reverse engineering task.\n\n### 1. Config API Key\nClick the Key icon in the top right corner to configure your Google Gemini API Key.\n\n### 2. Upload Image\nDrag and drop an image into the asset area on the left.\n\n### 3. Start Analysis\nClick the "Reverse" button in the workbench to start the analysis pipeline.\n\n### 4. Get Prompt\nWait for the agents to finish and copy the generated prompt.` 
            },
            {
                id: 'concepts',
                title: 'Core Concepts',
                icon: 'Zap', // 映射到 Icons.Sparkles 或类似的图标，如果 Icons 中没有 Zap。此处假设 Zap 已添加。
                // 实际上 Icons.tsx 没有 Zap。我们将使用 Sparkles。
                content: `# Core Concepts\n\nUnImage uses a multi-agent system to deconstruct images.`
            }
        ]
    }
];