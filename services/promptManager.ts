/**
 * 文件名: promptManager.ts
 * 功能: 提示词模板管理服务。
 * 核心逻辑:
 * 1. 管理不同 Agent 角色的 Prompt 版本 (Local Storage)。
 * 2. 支持获取、保存、激活和删除特定版本的 Prompt。
 */

export interface PromptVersion {
    id: string;
    name: string;
    content: string;
    updatedAt: number;
}

export const REVERSE_SKILL_ID = "reverse_skill";

class PromptManager {
    getVersions(role: string): PromptVersion[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(`prompt_versions_${role}`);
        return data ? JSON.parse(data) : [];
    }
    
    getActiveVersionId(role: string): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(`prompt_active_${role}`);
    }

    saveVersion(role: string, version: PromptVersion) {
        const versions = this.getVersions(role);
        const index = versions.findIndex(v => v.id === version.id);
        if (index >= 0) {
            versions[index] = version;
        } else {
            versions.push(version);
        }
        localStorage.setItem(`prompt_versions_${role}`, JSON.stringify(versions));
    }
    
    setActiveVersionId(role: string, id: string) {
        localStorage.setItem(`prompt_active_${role}`, id);
    }

    deleteVersion(role: string, id: string) {
        const versions = this.getVersions(role);
        const newVersions = versions.filter(v => v.id !== id);
        localStorage.setItem(`prompt_versions_${role}`, JSON.stringify(newVersions));
    }
}

export const promptManager = new PromptManager();