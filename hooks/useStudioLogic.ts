
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AgentRole, PipelineStepStatus, HistoryItem } from '../types';
import { AGENTS, PIPELINE_ORDER, VIDEO_DIRECTOR_INSTRUCTION } from '../constants';
import { 
    streamAgentAnalysis, 
    generateImageFromPrompt, 
    translatePrompt 
} from '../services/geminiService';
import { saveHistoryItem, deleteHistoryItemById } from '../services/historyService';
import { saveCurrentTask, clearCurrentTask } from '../services/cacheService';
import { soundService } from '../services/soundService';
import { PipelineProgress } from '../types';

const INITIAL_RESULTS = {
  [AgentRole.AUDITOR]: { role: AgentRole.AUDITOR, content: '', isStreaming: false, isComplete: false },
  [AgentRole.DESCRIPTOR]: { role: AgentRole.DESCRIPTOR, content: '', isStreaming: false, isComplete: false },
  [AgentRole.ARCHITECT]: { role: AgentRole.ARCHITECT, content: '', isStreaming: false, isComplete: false },
  [AgentRole.SYNTHESIZER]: { role: AgentRole.SYNTHESIZER, content: '', isStreaming: false, isComplete: false },
  [AgentRole.CRITIC]: { role: AgentRole.CRITIC, content: '', isStreaming: false, isComplete: false },
  [AgentRole.SORA_VIDEOGRAPHER]: { role: AgentRole.SORA_VIDEOGRAPHER, content: '', isStreaming: false, isComplete: false },
};

// Initial state constant
export const INITIAL_STATE: AppState = {
  image: null, mimeType: '', isProcessing: false, activeRole: null, results: INITIAL_RESULTS,
  isFusionMode: false, productImage: null, productMimeType: '', isVideoMode: false,
  generatedImage: null, generatedImages: [], isGeneratingImage: false,
  editablePrompt: '', promptHistory: [], currentPromptIndex: 0, isRefiningPrompt: false,
  useReferenceImage: false, isTemplatizing: false, detectedAspectRatio: "1:1",
  videoAnalysisDuration: null, isRefining: false, history: [], isHistoryOpen: false,
  isVersionDropdownOpen: false, layoutData: null, isAnalyzingLayout: false,
  suggestions: [], selectedSuggestionIndices: [], promptCache: { CN: '', EN: '' },
  selectedHistoryIndex: 0, referenceImages: [], isComparing: false, activeTab: 'STUDIO'
};

type TabType = AgentRole | 'STUDIO';

export const useStudioLogic = (
    initialAppState: Partial<AppState>,
    initialDisplayImage: string | null,
    pipelineControl: {
        initPipeline: () => void;
        startStep: (index: number) => void;
        updateStepContent: (index: number, content: string) => void;
        completeStep: (index: number, content: string) => void;
        completePipeline: () => void;
        setProgressDirect: (progress: PipelineProgress) => void;
    },
    showToast: (msg: string, type: 'info' | 'success' | 'error') => void
) => {
    // Core State
    const [state, setState] = useState<AppState>(INITIAL_STATE);
    const [displayImage, setDisplayImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('STUDIO');
    
    // Internal Refs
    const isPipelineRunning = useRef(false);

    // Initialization Effect
    useEffect(() => {
        if (Object.keys(initialAppState).length > 0) {
            setState(prev => ({ ...prev, ...initialAppState }));
        }
        if (initialDisplayImage) {
            setDisplayImage(initialDisplayImage);
        }
    }, [initialAppState, initialDisplayImage]);

    // Auto-save Effect
    useEffect(() => {
        if (state.image) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { history, ...rest } = state; // Don't cache history array
                saveCurrentTask(rest);
            } catch (e: any) {
                if (e.name === 'QuotaExceededError') showToast('本地存储已满', 'error');
            }
        }
    }, [state]);

    // --- Actions ---

    const handleFileSelected = useCallback((base64Data: string, aspectRatio: string, mimeType: string, duration?: number) => {
        setDisplayImage(`data:${mimeType};base64,${base64Data}`);
        setState(prev => ({
            ...INITIAL_STATE,
            history: prev.history,
            generatedImages: prev.generatedImages,
            selectedHistoryIndex: -1,
            image: base64Data,
            mimeType: mimeType,
            isFusionMode: prev.isFusionMode,
            isVideoMode: prev.isVideoMode,
            videoAnalysisDuration: duration || null,
            detectedAspectRatio: aspectRatio
        }));
        setActiveTab('STUDIO');
        isPipelineRunning.current = false;
    }, []);

    const handleProductFileSelected = useCallback((base64Data: string, aspectRatio: string, mimeType: string) => {
        setState(prev => ({ ...prev, productImage: base64Data, productMimeType: mimeType }));
        showToast("已加载产品参考图", "success");
    }, [showToast]);

    const handleReset = useCallback(() => {
        setDisplayImage(null);
        setState(prev => ({
            ...INITIAL_STATE,
            history: prev.history,
            generatedImages: prev.generatedImages,
            generatedImage: prev.generatedImage,
            selectedHistoryIndex: prev.selectedHistoryIndex,
            isFusionMode: prev.isFusionMode,
            isVideoMode: prev.isVideoMode
        }));
        clearCurrentTask();
    }, []);

    const pushPromptHistory = (newPrompt: string, source: string) => {
        if (!newPrompt.trim()) return;
        const entry = `[${source}] ${new Date().toLocaleTimeString('zh-CN')}\n${newPrompt}`;
        setState(prev => {
            const history = [entry, ...prev.promptHistory.filter(h => h !== entry)].slice(0, 20);
            return { ...prev, promptHistory: history, currentPromptIndex: 0 };
        });
    };

    const handleVideoDirectorAnalysis = async (setShowProgressView: (show: boolean) => void) => {
        if (!state.image || isPipelineRunning.current) return;
        isPipelineRunning.current = true;
        setState(prev => ({ ...prev, isProcessing: true }));
        setActiveTab(AgentRole.SORA_VIDEOGRAPHER);
        setShowProgressView(true);
        soundService.playStart();

        pipelineControl.setProgressDirect({
            isRunning: true, currentStepIndex: 0, totalProgress: 0, startTime: Date.now(),
            steps: [{ name: "Video Director", role: AgentRole.SORA_VIDEOGRAPHER, status: PipelineStepStatus.RUNNING, progress: 0, description: "Analyzing...", streamingContent: "", finalContent: "" }]
        });

        try {
            let content = "";
            const stream = streamAgentAnalysis(AgentRole.SORA_VIDEOGRAPHER, [{ data: state.image, mimeType: state.mimeType }], "", VIDEO_DIRECTOR_INSTRUCTION);
            for await (const chunk of stream) {
                content += chunk;
                setState(prev => ({ ...prev, results: { ...prev.results, [AgentRole.SORA_VIDEOGRAPHER]: { ...prev.results[AgentRole.SORA_VIDEOGRAPHER], content, isStreaming: true } } }));
                
                // Update progress view artificially
                const p = Math.min(98, Math.floor(content.length / 10));
                pipelineControl.setProgressDirect({
                    isRunning: true, currentStepIndex: 0, totalProgress: p, startTime: Date.now(),
                    steps: [{ name: "Video Director", role: AgentRole.SORA_VIDEOGRAPHER, status: PipelineStepStatus.RUNNING, progress: p, description: "Analyzing...", streamingContent: content, finalContent: content }]
                });
            }
            
            setState(prev => ({ 
                ...prev, 
                editablePrompt: content, 
                results: { ...prev.results, [AgentRole.SORA_VIDEOGRAPHER]: { ...prev.results[AgentRole.SORA_VIDEOGRAPHER], isComplete: true, isStreaming: false } } 
            }));
            pushPromptHistory(content, 'Video Director');
            soundService.playComplete();
            
            pipelineControl.setProgressDirect({
                isRunning: false, currentStepIndex: 0, totalProgress: 100, startTime: Date.now(),
                steps: [{ name: "Video Director", role: AgentRole.SORA_VIDEOGRAPHER, status: PipelineStepStatus.COMPLETED, progress: 100, description: "Completed", streamingContent: content, finalContent: content }]
            });

            setTimeout(() => { setShowProgressView(false); setActiveTab('STUDIO'); showToast("视频提示词生成完成", "success"); }, 1500);
        } catch (e) { 
            showToast("Video Analysis Failed", "error"); 
        } finally { 
            isPipelineRunning.current = false; 
            setState(prev => ({ ...prev, isProcessing: false })); 
        }
    };

    const processImagePipeline = async (setShowProgressView: (show: boolean) => void) => {
        if (!state.image || isPipelineRunning.current) return;
        isPipelineRunning.current = true;
        setState(prev => ({ ...prev, isProcessing: true }));
        pipelineControl.initPipeline();
        setShowProgressView(true);
        setActiveTab('STUDIO');
        soundService.playStart();

        try {
            const steps = state.isFusionMode ? [AgentRole.AUDITOR, AgentRole.ARCHITECT, AgentRole.DESCRIPTOR, AgentRole.SYNTHESIZER] : PIPELINE_ORDER;
            let context = "";
            for (let i = 0; i < steps.length; i++) {
                const role = steps[i];
                pipelineControl.startStep(i);
                if (role !== AgentRole.SYNTHESIZER) setActiveTab(role as any);

                let content = "";
                // Handle Fusion Logic
                let inputs = [{ data: state.image, mimeType: state.mimeType }];
                if (state.isFusionMode && state.productImage && (role === AgentRole.DESCRIPTOR || role === AgentRole.SYNTHESIZER)) {
                     // For descriptor in fusion, verify if we analyze product or scene. 
                     // Simplified logic: Synthesizer gets both.
                     if (role === AgentRole.SYNTHESIZER) {
                         inputs.push({ data: state.productImage, mimeType: state.productMimeType });
                     } else if (role === AgentRole.DESCRIPTOR) {
                         // Swap to product for descriptor in fusion mode
                         inputs = [{ data: state.productImage, mimeType: state.productMimeType }];
                     }
                }

                const stream = streamAgentAnalysis(role, inputs, context);
                for await (const chunk of stream) {
                    content += chunk;
                    pipelineControl.updateStepContent(i, content);
                    setState(prev => ({ ...prev, results: { ...prev.results, [role]: { ...prev.results[role], content, isStreaming: true } } }));
                }
                context += `\n--${role}--\n${content}`;
                pipelineControl.completeStep(i, content);
                setState(prev => ({ ...prev, results: { ...prev.results, [role]: { ...prev.results[role], isComplete: true, isStreaming: false } } }));
                soundService.playStepComplete();
                
                if (role === AgentRole.SYNTHESIZER) {
                    setState(prev => ({ ...prev, editablePrompt: content }));
                    pushPromptHistory(content, 'Pipeline');
                }
            }
            pipelineControl.completePipeline();
            soundService.playComplete();
            setTimeout(() => { setShowProgressView(false); setActiveTab('STUDIO'); showToast("提示词生成完成", "success"); }, 2000);
        } catch (e) { 
            console.error(e); 
            showToast("Pipeline Error", "error");
        } finally { 
            isPipelineRunning.current = false; 
            setState(prev => ({ ...prev, isProcessing: false })); 
        }
    };

    const handleGenerateImage = async (customPrompt?: string, count: number = 1) => {
        if (state.isGeneratingImage) return;
        setState(prev => ({ ...prev, isGeneratingImage: true }));
        try {
            for (let i = 0; i < count; i++) {
                const img = await generateImageFromPrompt(
                    customPrompt || state.editablePrompt, 
                    state.detectedAspectRatio, 
                    state.useReferenceImage ? state.image : null
                );
                if (img) {
                    const newItem: HistoryItem = { 
                        id: Date.now().toString() + i, 
                        timestamp: Date.now(), 
                        originalImage: state.image!, 
                        mimeType: state.mimeType, 
                        prompt: customPrompt || state.editablePrompt, 
                        generatedImage: img,
                        isFusionMode: state.isFusionMode,
                        productImage: state.productImage || undefined
                    };
                    await saveHistoryItem(newItem);
                    setState(prev => ({ 
                        ...prev, 
                        generatedImage: img, 
                        generatedImages: [img, ...prev.generatedImages], 
                        history: [newItem, ...prev.history], 
                        selectedHistoryIndex: 0 
                    }));
                }
            }
            if (count > 0) showToast(`成功生成 ${count} 张图片`, 'success');
        } catch (e) { 
            showToast("生成失败", "error"); 
        } finally { 
            setState(prev => ({ ...prev, isGeneratingImage: false })); 
        }
    };

    const loadHistoryItem = useCallback((index: number) => {
        if (index < 0 || index >= state.history.length) return;
        const historyItem = state.history[index];
        if (!historyItem) return;
        setState(prev => ({
            ...prev, selectedHistoryIndex: index,
            editablePrompt: historyItem.prompt,
            promptCache: { ...prev.promptCache, CN: historyItem.prompt },
            image: historyItem.originalImage,
            mimeType: historyItem.mimeType || 'image/png',
            isFusionMode: historyItem.isFusionMode || false,
            productImage: historyItem.productImage || null,
            detectedAspectRatio: historyItem.detectedAspectRatio || '1:1',
            generatedImage: historyItem.generatedImage
        }));
        setDisplayImage(`data:${historyItem.mimeType};base64,${historyItem.originalImage}`);
    }, [state.history]);

    const handleDeleteHistoryItem = useCallback(async (index: number) => {
        const item = state.history[index];
        if (item?.id) await deleteHistoryItemById(item.id);
        setState(prev => {
            const newImgs = [...prev.generatedImages]; newImgs.splice(index, 1);
            const newHist = [...prev.history]; newHist.splice(index, 1);
            let newIndex = prev.selectedHistoryIndex;
            if (index <= newIndex) newIndex = Math.max(0, newIndex - 1);
            
            return { 
                ...prev, 
                generatedImages: newImgs, 
                history: newHist, 
                selectedHistoryIndex: newIndex,
                generatedImage: newImgs.length > 0 ? newImgs[newIndex] : null
            };
        });
        showToast("记录已删除", "info");
    }, [state.history, showToast]);

    const handleDownloadHD = (index: number) => {
        const img = state.generatedImages[index];
        if (!img) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${img}`;
        link.download = `generated-${Date.now()}.png`;
        link.click();
        showToast("开始下载", "success");
    };

    const handleToggleLanguage = async (currentLang: 'CN' | 'EN', setCurrentLang: (l: 'CN' | 'EN') => void) => {
        const target = currentLang === 'CN' ? 'EN' : 'CN';
        if (state.promptCache[target]) {
            setState(prev => ({ ...prev, editablePrompt: prev.promptCache[target] }));
            setCurrentLang(target);
            return;
        }
        showToast(`正在切换至 ${target === 'EN' ? '英文 MJ 模式' : '中文工程模式'}...`, 'info');
        try {
            const translated = await translatePrompt(state.editablePrompt, target);
            setState(prev => ({
                ...prev, editablePrompt: translated,
                promptCache: { ...prev.promptCache, [target]: translated }
            }));
            pushPromptHistory(translated, target === 'EN' ? '英文翻译' : '中文翻译');
            setCurrentLang(target);
        } catch (e) { showToast("翻译失败", "error"); }
    };

    return {
        state,
        setState,
        displayImage,
        setDisplayImage,
        activeTab,
        setActiveTab,
        isPipelineRunning,
        actions: {
            handleFileSelected,
            handleProductFileSelected,
            handleReset,
            handleVideoDirectorAnalysis,
            processImagePipeline,
            handleGenerateImage,
            loadHistoryItem,
            handleDeleteHistoryItem,
            handleDownloadHD,
            handleToggleLanguage
        }
    };
};
