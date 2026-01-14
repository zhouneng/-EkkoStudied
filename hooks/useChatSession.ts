/**
 * 文件名: useChatSession.ts
 * 功能: 聊天会话管理 Hook。
 * 核心逻辑:
 * 1. 管理聊天消息列表和加载状态。
 * 2. 处理用户发送消息，识别意图并调用相应服务。
 * 3. 管理聊天侧边栏的开关状态。
 */

import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
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

interface ChatContext {
    image: string | null;
    generatedImage: string | null;
    editablePrompt: string;
    mimeType: string;
}

export const useChatSession = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const addMessage = useCallback((msg: ChatMessage) => {
        setMessages(prev => [...prev, msg]);
    }, []);

    const updateLastMessage = useCallback((content: string) => {
        setMessages(prev => {
            if (prev.length === 0) return prev;
            const newHistory = [...prev];
            const lastMsg = newHistory[newHistory.length - 1];
            newHistory[newHistory.length - 1] = { ...lastMsg, content, isStreaming: true };
            return newHistory;
        });
    }, []);

    const sendMessage = useCallback(async (content: string, context: ChatContext) => {
        if (!content.trim()) return;

        const userMsg = createUserMessage(content);
        addMessage(userMsg);
        setIsProcessing(true);
        setIsDrawerOpen(true); // Open drawer on message send

        try {
            const skill = detectSkillIntent(content);

            if (skill === 'quality-check') {
                if (!context.image || !context.generatedImage) {
                    addMessage(createAssistantMessage("请先上传参考图并生成一张图片，才能进行质检对比。"));
                    setIsProcessing(false);
                    return;
                }
                const assistantMsg = createAssistantMessage("正在进行像素级质检...", true);
                addMessage(assistantMsg);

                const { content: result, suggestions } = await executeQualityCheck(
                    context.image,
                    context.generatedImage,
                    (chunk) => updateLastMessage(chunk)
                );
                
                // Replace streaming message with skill result
                setMessages(prev => {
                    const newHistory = [...prev];
                    newHistory.pop(); // remove streaming msg
                    return [...newHistory, createSkillResultMessage('quality-check', result, suggestions)];
                });

            } else if (skill === 'reverse') {
                if (!context.image) {
                    addMessage(createAssistantMessage("请先上传参考图。"));
                    setIsProcessing(false);
                    return;
                }
                addMessage(createAssistantMessage("正在执行快速逆向分析...", true));
                
                const { content: result } = await executeReverseSkill(context.image, context.mimeType);
                
                setMessages(prev => {
                    const newHistory = [...prev];
                    newHistory.pop();
                    return [...newHistory, createSkillResultMessage('reverse', result, [result])];
                });

            } else if (skill === 'refine') {
                addMessage(createAssistantMessage("正在根据指令优化 Prompt...", true));
                const refined = await executeRefineSkill(
                    context.editablePrompt, 
                    content, 
                    context.image, 
                    context.mimeType
                );
                
                setMessages(prev => {
                    const newHistory = [...prev];
                    newHistory.pop();
                    return [...newHistory, createSkillResultMessage('refine', `优化后的 Prompt:\n\n${refined}`, [refined])];
                });

            } else {
                // General Chat
                const ai = createGeminiClient();
                const model = 'gemini-3-flash-preview';
                
                const parts: any[] = [{ text: content }];
                if (context.image) {
                    parts.unshift({ inlineData: { mimeType: context.mimeType, data: context.image } });
                }

                // Add placeholder for streaming
                addMessage(createAssistantMessage("", true));

                const stream = await ai.models.generateContentStream({
                    model,
                    contents: { parts }
                });

                let fullText = "";
                for await (const chunk of stream) {
                    if (chunk.text) {
                        fullText += chunk.text;
                        updateLastMessage(fullText);
                    }
                }
                
                setMessages(prev => {
                    const newHistory = [...prev];
                    const lastMsg = newHistory[newHistory.length - 1];
                    newHistory[newHistory.length - 1] = { ...lastMsg, content: fullText, isStreaming: false };
                    return newHistory;
                });
            }

        } catch (e: any) {
            console.error(e);
            addMessage(createAssistantMessage(`Error: ${e.message || "Something went wrong."}`));
        } finally {
            setIsProcessing(false);
        }
    }, [addMessage, updateLastMessage]);

    return {
        messages,
        isProcessing,
        sendMessage,
        isDrawerOpen,
        setIsDrawerOpen
    };
};