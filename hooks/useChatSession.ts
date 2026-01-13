
import { useState, useCallback } from 'react';
import { ChatMessage, SkillType, AgentRole } from '../types';
import { 
    createUserMessage, 
    createAssistantMessage, 
    createSkillResultMessage, 
    detectSkillIntent, 
    executeQualityCheck, 
    executeReverseSkill, 
    executeRefineSkill 
} from '../services/chatService';
import { createGeminiClient } from '../services/geminiService';

export interface ExecuteSkillParams {
    image: string | null;
    generatedImage: string | null;
    editablePrompt: string;
    mimeType: string;
}

export const useChatSession = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const sendMessage = useCallback(async (message: string, context: ExecuteSkillParams) => {
        if (!message.trim() || isProcessing) return;

        // 1. Add User Message
        const userMsg = createUserMessage(message);
        setMessages(prev => [...prev, userMsg]);
        setIsProcessing(true);
        if (!isDrawerOpen) setIsDrawerOpen(true);

        try {
            const intent = detectSkillIntent(message);

            // 2. Skill Execution
            if (intent === 'quality-check' && context.image && context.generatedImage) {
                const { content, suggestions } = await executeQualityCheck(context.image, context.generatedImage, () => {});
                const resultMsg = createSkillResultMessage('quality-check', content, suggestions);
                setMessages(prev => [...prev, resultMsg]);
            } 
            else if (intent === 'reverse' && context.image) {
                const { content, suggestions } = await executeReverseSkill(context.image, context.mimeType);
                const resultMsg = createSkillResultMessage('reverse', content, suggestions);
                setMessages(prev => [...prev, resultMsg]);
            } 
            else if (intent === 'refine' && context.editablePrompt) {
                const result = await executeRefineSkill(context.editablePrompt, message, context.image, context.mimeType);
                const resultMsg = createSkillResultMessage('refine', "Here is a suggestion based on your request:", [result]);
                setMessages(prev => [...prev, resultMsg]);
            } 
            else {
                // Default Chat
                const ai = createGeminiClient();
                const result = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: { parts: [{ text: message }] }
                });
                const text = result.text || "I didn't get a response.";
                setMessages(prev => [...prev, createAssistantMessage(text)]);
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, createAssistantMessage("Sorry, I encountered an error processing your request.")]);
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, isDrawerOpen]);

    return {
        messages,
        setMessages,
        isProcessing,
        isDrawerOpen,
        setIsDrawerOpen,
        sendMessage
    };
};
