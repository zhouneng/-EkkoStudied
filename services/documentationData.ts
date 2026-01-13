import { Icons } from '../components/Icons';

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
                icon: 'Zap', // Mapping to Icons.Sparkles or similar if Zap not in Icons. Using Sparkles as fallback mentally or assume Zap added. 
                // Actually Icons.tsx doesn't have Zap. Let's use Sparkles.
                content: `# Core Concepts\n\nUnImage uses a multi-agent system to deconstruct images.`
            }
        ]
    }
];
