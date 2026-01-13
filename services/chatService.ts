import { createGeminiClient } from './geminiService';
import { ChatMessage, SkillType, AgentRole } from '../types';
import { AGENTS } from '../constants';

export const createUserMessage = (content: string): ChatMessage => ({
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: Date.now()
});

export const createAssistantMessage = (content: string, isStreaming = false): ChatMessage => ({
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content,
    timestamp: Date.now(),
    isStreaming
});

export const createSkillResultMessage = (skillType: SkillType, content: string, suggestions?: string[]): ChatMessage => ({
    id: (Date.now() + 2).toString(),
    role: 'skill-result',
    content,
    skillType,
    suggestions,
    timestamp: Date.now(),
    selectedIndices: suggestions ? suggestions.map((_, i) => i) : [],
    applied: false
});

export const detectSkillIntent = (message: string): SkillType => {
    const m = message.toLowerCase();
    if (m.includes('质检') || m.includes('check') || m.includes('audit')) return 'quality-check';
    if (m.includes('逆向') || m.includes('reverse')) return 'reverse';
    if (m.includes('修') || m.includes('改') || m.includes('refine')) return 'refine';
    if (m.includes('翻译') || m.includes('translate')) return 'translate';
    if (m.includes('生成') || m.includes('generate')) return 'generate';
    return 'other';
};

export const executeQualityCheck = async (
    originalImage: string,
    generatedImage: string,
    onStream: (content: string) => void
): Promise<{ content: string; suggestions: string[] }> => {
    const ai = createGeminiClient();
    const model = 'gemini-3-flash-preview'; 
    const prompt = "Compare these two images. First is original, second is generated. Provide a quality check report and 3 specific suggestions for improvement.";
    
    const stream = await ai.models.generateContentStream({
        model,
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: originalImage } },
                { inlineData: { mimeType: 'image/png', data: generatedImage } },
                { text: prompt }
            ]
        },
        config: {
            systemInstruction: AGENTS[AgentRole.CRITIC].systemInstruction
        }
    });

    let content = '';
    for await (const chunk of stream) {
        if (chunk.text) {
            content += chunk.text;
            onStream(content);
        }
    }

    // Simple parsing logic for suggestions (assuming standard markdown list format)
    const suggestions = content
        .split('\n')
        .filter(line => line.match(/^\d+\.|^[\*\-]/))
        .map(line => line.replace(/^[\d+\.|\*\-]\s*/, '').trim())
        .slice(0, 3);

    return { content, suggestions };
};

export const executeReverseSkill = async (image: string, mimeType: string): Promise<{content: string, suggestions: string[]}> => {
    const ai = createGeminiClient();
    const model = 'gemini-3-flash-preview';
    const prompt = "Perform a quick reverse engineering of this image to generate a high-quality prompt.";
    
    const result = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { mimeType, data: image } },
                { text: prompt }
            ]
        }
    });
    
    const content = result.text || "";
    return { content, suggestions: [content] };
};

export const executeRefineSkill = async (currentPrompt: string, instruction: string, image: string | null, mimeType: string): Promise<string> => {
    const ai = createGeminiClient();
    const model = 'gemini-3-flash-preview';
    
    const parts: any[] = [{ text: `Current Prompt: ${currentPrompt}\nInstruction: ${instruction}\nRefined Prompt:` }];
    if (image) {
        parts.unshift({ inlineData: { mimeType, data: image } });
    }

    const result = await ai.models.generateContent({
        model,
        contents: { parts }
    });

    return result.text || currentPrompt;
};
