
import React, { useState } from 'react';
import { Icons } from '../Icons';
import { AppState, ReferenceImage, AgentRole, PipelineProgress } from '../../types';
import { promptManager } from '../../services/promptManager';
import { ReferenceImageList } from '../ReferenceImageList';
import { PipelineProgressView } from '../PipelineProgressView';

interface PromptStudioViewProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  aiInput: string;
  setAiInput: React.Dispatch<React.SetStateAction<string>>;
  isAnalyzing: boolean;
  isChatProcessing: boolean;
  reverseMode: 'full' | 'quick';
  setReverseMode: (mode: 'full' | 'quick') => void;
  activeModelName: string;
  pipelineProgress: PipelineProgress | null;
  
  // Callbacks
  onToggleLanguage: () => void;
  onGenerateImage: (customPrompt?: string, count?: number) => void;
  onChatSendMessage: (message: string) => void;
  onSmartAnalysis: (image: string, generatedImage: string, prompt: string) => Promise<string>;
  onCancelAnalysis: () => void; // Resets pipeline
  onVideoDirectorAnalysis: () => void;
  onQuickReverse: () => void;
  onStartPipeline: () => void;
  onRegenerateAgent: (role: AgentRole) => void;
  showToast: (msg: string, type: 'info' | 'success' | 'error') => void;
  setActiveTab: (tab: string) => void;
}

export const PromptStudioView: React.FC<PromptStudioViewProps> = ({
  state,
  setState,
  aiInput,
  setAiInput,
  isAnalyzing,
  isChatProcessing,
  reverseMode,
  setReverseMode,
  activeModelName,
  pipelineProgress,
  onToggleLanguage,
  onGenerateImage,
  onChatSendMessage,
  onSmartAnalysis,
  onCancelAnalysis,
  onVideoDirectorAnalysis,
  onQuickReverse,
  onStartPipeline,
  onRegenerateAgent,
  showToast,
  setActiveTab
}) => {
  const [isDraggingReference, setIsDraggingReference] = useState(false);
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false);
  const [isGenerateMenuOpen, setIsGenerateMenuOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false); 

  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-900 relative transition-colors duration-300">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-stone-200 dark:border-stone-800 flex-shrink-0 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-800 dark:text-stone-300 text-base font-serif transition-colors">Prompt Studio</h3>
            <p className="text-[10px] text-stone-500 font-medium uppercase mt-0.5">提示词编辑器</p>
          </div>

          {/* 模式切换器 */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1 transition-colors">
            <button
              onClick={() => setReverseMode('full')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${reverseMode === 'full' ? 'bg-white dark:bg-stone-600 text-stone-800 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'}`}
            >
              完整分析
            </button>
            <button
              onClick={() => setReverseMode('quick')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${reverseMode === 'quick' ? 'bg-white dark:bg-stone-600 text-stone-800 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'}`}
            >
              快速逆向
            </button>
          </div>
          
          {/* Version Selector - Custom Dropdown */}
          <div className="relative">
            <button
              onClick={() => setState(prev => ({ ...prev, isVersionDropdownOpen: !prev.isVersionDropdownOpen }))}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg text-xs font-bold text-stone-600 dark:text-stone-300 transition-colors"
            >
              <span>{promptManager.getVersions(AgentRole.SYNTHESIZER).find(v => v.id === promptManager.getActiveVersionId(AgentRole.SYNTHESIZER))?.name || '选择版本'}</span>
              <Icons.ChevronDown size={12} className={`transition-transform ${state.isVersionDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {state.isVersionDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setState(prev => ({ ...prev, isVersionDropdownOpen: false }))} />
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  {promptManager.getVersions(AgentRole.SYNTHESIZER).map(v => (
                    <div
                      key={v.id}
                      onClick={() => {
                        promptManager.setActiveVersionId(AgentRole.SYNTHESIZER, v.id);
                        setState(prev => ({ ...prev, isVersionDropdownOpen: false }));
                      }}
                      className={`px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer text-xs transition-colors flex items-center gap-2 ${v.id === promptManager.getActiveVersionId(AgentRole.SYNTHESIZER)
                        ? 'bg-stone-100 dark:bg-stone-700 text-orange-600 dark:text-orange-400'
                        : 'text-stone-600 dark:text-stone-300'
                        }`}
                    >
                      {v.id === promptManager.getActiveVersionId(AgentRole.SYNTHESIZER) && <Icons.Check size={12} />}
                      <span>{v.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {state.promptHistory.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsHistoryDropdownOpen(!isHistoryDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-500 dark:hover:bg-amber-900/40 rounded-lg text-[9px] font-bold transition-colors"
                >
                  <Icons.History size={10} />
                  {state.promptHistory.length}
                </button>
                {isHistoryDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    {state.promptHistory.map((entry, idx) => {
                      const lines = entry.split('\n');
                      const header = lines[0];
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            const content = lines.slice(1).join('\n');
                            setState(prev => ({ ...prev, editablePrompt: content }));
                            setIsHistoryDropdownOpen(false);
                          }}
                          className="px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer text-[10px] border-b border-stone-100 dark:border-stone-700 last:border-b-0"
                        >
                          <span className="font-bold text-amber-600 dark:text-amber-500">{header}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <button onClick={onToggleLanguage} className="p-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 rounded-lg transition-colors" title="翻译">
              <Icons.Languages size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 min-h-0 p-4 flex flex-col relative group">
        <div
          className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-200 z-10 
              ${isDraggingReference ? 'border-2 border-emerald-500 bg-emerald-500/10' : 'border border-transparent'}`}
        >
          {isDraggingReference && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-emerald-500">
              <Icons.Download size={32} />
              <span className="text-xs font-bold mt-2">添加参考图</span>
            </div>
          )}
        </div>

        <textarea
          value={state.editablePrompt}
          onChange={(e) => setState(prev => ({ ...prev, editablePrompt: e.target.value }))}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingReference(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingReference(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingReference(false);

            const files = (Array.from(e.dataTransfer.files) as File[]).filter((f) => f.type.startsWith('image/'));
            if (files.length === 0) return;

            Promise.all(files.map(file => new Promise<ReferenceImage>((resolve) => {
              const reader = new FileReader();
              reader.onload = (ev) => {
                resolve({
                  id: crypto.randomUUID(),
                  url: ev.target?.result as string,
                  name: file.name,
                  mimeType: file.type,
                  aspectRatio: '1:1' // Will be updated
                });
              };
              reader.readAsDataURL(file);
            }))).then(async (tempImages) => {
              const processedImages = await Promise.all(tempImages.map(async img => {
                return new Promise<ReferenceImage>(resolve => {
                  const image = new Image();
                  image.onload = () => {
                    const ratio = image.naturalWidth / image.naturalHeight;
                    const ratios = [
                      { id: "1:1", value: 1.0 },
                      { id: "3:4", value: 0.75 },
                      { id: "4:3", value: 1.333 },
                      { id: "9:16", value: 0.5625 },
                      { id: "16:9", value: 1.777 }
                    ];
                    const closest = ratios.reduce((prev, curr) =>
                      Math.abs(curr.value - ratio) < Math.abs(prev.value - ratio) ? curr : prev
                    );
                    resolve({ ...img, aspectRatio: closest.id });
                  };
                  image.src = img.url;
                });
              }));

              setState(prev => ({
                ...prev,
                referenceImages: [...prev.referenceImages, ...processedImages]
              }));
              showToast(`已添加 ${processedImages.length} 张参考图`, 'success');
            });
          }}
          className="flex-1 w-full bg-stone-100 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 p-4 text-[12px] font-mono leading-relaxed focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 outline-none resize-none overflow-y-auto custom-scrollbar text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-600 relative z-20 transition-colors duration-300"
          placeholder="输入提示词，或上传图片逆向生成..."
          spellCheck={false}
        />

        {/* Reference Image List */}
        {state.referenceImages?.length > 0 && (
          <div className="mt-2 border-t border-stone-200 dark:border-stone-800 pt-2 relative z-20 transition-colors">
            <ReferenceImageList
              images={state.referenceImages}
              onRemove={(id) => {
                setState(prev => ({
                  ...prev,
                  referenceImages: prev.referenceImages.filter(img => img.id !== id)
                }));
              }}
              onPreview={(img) => {
                  // Stub for preview
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex-shrink-0 space-y-3 transition-colors">
        {/* Button Row */}
        <div className="flex items-center gap-2">
          {/* Scrollable Tags Area */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0 max-w-[40%]">
            {state.image && (
              <button
                onClick={() => {
                  const tag = '@原图';
                  setAiInput(prev => {
                    if (prev.includes(tag)) {
                      return prev.replace(tag, '').replace(/\s{2,}/g, ' ').trim();
                    }
                    return (prev + ' ' + tag).trim();
                  });
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-bold flex-shrink-0 whitespace-nowrap border ${aiInput.includes('@原图')
                  ? 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-500/30'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-orange-400 border-transparent'
                  }`}
              >
                <Icons.Image size={14} />
                @原图
              </button>
            )}
            {state.generatedImage && (
              <button
                onClick={() => {
                  const tag = '@生成图';
                  setAiInput(prev => {
                    if (prev.includes(tag)) {
                      return prev.replace(tag, '').replace(/\s{2,}/g, ' ').trim();
                    }
                    return (prev + ' ' + tag).trim();
                  });
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-bold flex-shrink-0 whitespace-nowrap border ${aiInput.includes('@生成图')
                  ? 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/30'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-emerald-400 border-transparent'
                  }`}
              >
                <Icons.Image size={14} />
                @生成图
              </button>
            )}
          </div>

          {/* Main Actions Area */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => {
                if (state.isVideoMode) {
                    onVideoDirectorAnalysis();
                } else if (reverseMode === 'quick') {
                  onQuickReverse();
                } else {
                  const hasAuditorContent = state.results[AgentRole.AUDITOR]?.content?.trim();
                  const hasDescriptorContent = state.results[AgentRole.DESCRIPTOR]?.content?.trim();
                  const hasArchitectContent = state.results[AgentRole.ARCHITECT]?.content?.trim();

                  if (!hasAuditorContent && !hasDescriptorContent && !hasArchitectContent) {
                    if (state.image) {
                      onStartPipeline();
                    } else {
                      showToast('请先上传图片', 'error');
                    }
                  } else {
                    onRegenerateAgent(AgentRole.SYNTHESIZER);
                  }
                }
              }}
              disabled={!state.image || state.isProcessing}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all border whitespace-nowrap px-3 min-w-fit
                ${state.isVideoMode 
                    ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800 dark:border-indigo-800'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700'
                }`}
              title={state.isVideoMode ? '执行视频导演分析' : reverseMode === 'quick' ? '快速单步逆向' : '完整4步分析'}
            >
              {state.isVideoMode ? <Icons.Film size={14} /> : <Icons.Sparkles size={14} />}
              {state.isVideoMode ? 'Video Reverse' : '逆向'}
            </button>
            {/* Generate Button Group */}
            <div className="relative flex-1 flex min-w-fit">
              <button
                onClick={() => onGenerateImage(undefined, generateCount)}
                disabled={state.isGeneratingImage || !state.editablePrompt}
                className="flex-1 px-3 py-2 bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-black dark:hover:bg-white rounded-l-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] whitespace-nowrap"
              >
                {state.isGeneratingImage ? <Icons.RefreshCw size={14} className="animate-spin" /> : <Icons.Play size={14} />}
                生成{generateCount > 1 ? ` ${generateCount}` : ''}
              </button>
              <button
                onClick={() => setIsGenerateMenuOpen(!isGenerateMenuOpen)}
                disabled={state.isGeneratingImage || !state.editablePrompt}
                className="px-2 py-2 bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-black dark:hover:bg-white rounded-r-xl text-xs font-bold flex items-center justify-center disabled:opacity-40 transition-all border-l border-stone-700 dark:border-stone-300"
              >
                <Icons.ChevronDown size={12} className={`transition-transform ${isGenerateMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isGenerateMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsGenerateMenuOpen(false)} />
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl z-50 overflow-hidden min-w-[120px]">
                    {[1, 2, 4].map(num => (
                      <div
                        key={num}
                        onClick={() => {
                          setGenerateCount(num);
                          setIsGenerateMenuOpen(false);
                        }}
                        className={`px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer text-xs transition-colors flex items-center gap-2 ${num === generateCount ? 'bg-stone-100 dark:bg-stone-700 text-orange-600 dark:text-orange-400' : 'text-stone-700 dark:text-stone-300'}`}
                      >
                        {num === generateCount && <Icons.Check size={12} />}
                        <span>生成 {num} 张</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(state.editablePrompt); showToast('已复制', 'success'); }}
            disabled={!state.editablePrompt}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition-all flex-shrink-0"
            title="复制提示词"
          >
            <Icons.Copy size={14} />
            复制
          </button>
          <button
            onClick={() => {
                (window as any).dispatchEvent(new CustomEvent('toggle-chat-drawer')); 
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 bg-stone-100 text-stone-500 hover:text-stone-900 dark:bg-stone-800 dark:text-stone-500 dark:hover:text-stone-300`}
            title="历史记录"
          >
            <Icons.MessageSquare size={14} />
            历史
          </button>
        </div>

        {/* AI Input Area - Two Row Layout */}
        <div className="bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors">
          <div className="px-3 pt-2.5 pb-0">
            <textarea
              value={aiInput}
              onChange={(e) => {
                setAiInput(e.target.value);
                // Simple auto-height logic
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && aiInput.trim()) {
                  e.preventDefault();
                  onChatSendMessage(aiInput.trim());
                  setAiInput('');
                }
              }}
              placeholder={isAnalyzing ? "正在分析差异..." : "输入 AI 指令..."}
              className={`w-full bg-transparent border-none text-sm outline-none text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-none min-h-[20px] max-h-[100px] leading-snug ${isAnalyzing ? 'placeholder:animate-pulse' : ''}`}
              disabled={isChatProcessing || isAnalyzing}
              rows={1}
            />
          </div>

          <div className="px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer transition-colors text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300" title="上传图片">
                <Icons.Plus size={16} />
                {/* Simplified Input for UI consistency, real upload logic might be drag/drop primarily here */}
                <input type="file" className="hidden" disabled /> 
              </label>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">{activeModelName}</span>
            </div>

            <div className="flex items-center gap-2">
              {isAnalyzing ? (
                <button
                  onClick={() => {
                    // Logic to cancel/reset state in parent
                    setAiInput('');
                  }}
                  className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-600 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Icons.X size={12} />
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (!state.image || !state.generatedImage) return;
                    setAiInput('分析中...');
                    try {
                      const suggestion = await onSmartAnalysis(state.image, state.generatedImage, state.editablePrompt);
                      setAiInput(suggestion);
                    } catch(e) {
                      setAiInput('分析失败');
                    }
                  }}
                  disabled={!state.image || !state.generatedImage || isChatProcessing}
                  className="p-1.5 bg-violet-100 hover:bg-violet-200 text-violet-600 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 dark:text-violet-400 rounded-lg disabled:opacity-40 transition-all"
                >
                  <Icons.Sparkles size={14} />
                </button>
              )}
              <button
                onClick={() => {
                  if (aiInput.trim()) {
                    onChatSendMessage(aiInput.trim());
                    setAiInput('');
                  }
                }}
                disabled={!aiInput.trim() || isChatProcessing}
                className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 dark:bg-stone-700 dark:text-white dark:hover:bg-stone-600 rounded-lg disabled:opacity-40 transition-all"
              >
                {isChatProcessing ? <Icons.RefreshCw size={14} className="animate-spin" /> : <Icons.ArrowUp size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overlay */}
      {state.isProcessing && pipelineProgress && (
        <PipelineProgressView
          progress={pipelineProgress}
          onHide={() => setActiveTab('STUDIO')} 
          onCancel={onCancelAnalysis}
        />
      )}
    </div>
  );
};
