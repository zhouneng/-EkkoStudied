import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, ToastMessage, ToastType } from './components/ToastContainer';
import { Icons } from './components/Icons';
import { executeSmartAnalysis } from './services/geminiService';
import { soundService } from './services/soundService';
import { usePipelineProgress } from './hooks/usePipelineProgress';
import { useAppInit } from './hooks/useAppInit';
import { useChatSession } from './hooks/useChatSession';
import { useStudioLogic, INITIAL_STATE } from './hooks/useStudioLogic';
import { AgentRole, AppState } from './types';
import { LandingPage } from './components/LandingPage';
import { DocumentationModal } from './components/DocumentationModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PromptLabModal } from './components/PromptLabModal';
import { ImageZoomState } from './utils/zoom';

// Components
import { AppHeader } from './components/AppHeader';
import { HistoryBottomBar } from './components/HistoryBottomBar';
import { LeftPanel } from './components/panels/LeftPanel';
import { RightPanel } from './components/panels/RightPanel';

type TabType = AgentRole.AUDITOR | AgentRole.DESCRIPTOR | AgentRole.ARCHITECT | AgentRole.SYNTHESIZER | AgentRole.SORA_VIDEOGRAPHER | 'STUDIO';

const App: React.FC = () => {
  // 1. Initialization
  const { 
    showLanding, setShowLanding, hasKey, theme, setTheme, apiMode, activeModelName, initialAppState, initialDisplayImage 
  } = useAppInit(INITIAL_STATE);

  // 2. UI State (View-only, not Logic)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isPromptLabOpen, setIsPromptLabOpen] = useState(false);
  
  // UI Preferences
  const [isComparisonMode, setIsComparisonMode] = useState(() => JSON.parse(localStorage.getItem('unimage_comparison_mode') || 'false'));
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => parseFloat(localStorage.getItem('unimage_left_panel_width') || '50'));
  const [rightPanelWidth, setRightPanelWidth] = useState(() => parseInt(localStorage.getItem('unimage_right_panel_width') || '320'));
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [isDraggingRightDivider, setIsDraggingRightDivider] = useState(false);
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const [isFullscreenComparison, setIsFullscreenComparison] = useState(false);
  const [imageZoom, setImageZoom] = useState<ImageZoomState>({ scale: 1, panX: 0, panY: 0 });
  const [showProgressView, setShowProgressView] = useState(false); // Controls the progress overlay visibility

  // Prompt Studio Specific UI State
  const [currentLang, setCurrentLang] = useState<'CN' | 'EN'>('CN');
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reverseMode, setReverseMode] = useState<'full' | 'quick'>('quick');

  const mainRef = useRef<HTMLElement>(null);

  // 3. Logic Hooks
  const pipelineControl = usePipelineProgress();
  
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const { 
      state, setState, displayImage, setDisplayImage, activeTab, setActiveTab, isPipelineRunning, actions 
  } = useStudioLogic(initialAppState, initialDisplayImage, pipelineControl, showToast);

  const chatSession = useChatSession();

  // 4. Effects for UI Persistence
  useEffect(() => { localStorage.setItem('unimage_comparison_mode', JSON.stringify(isComparisonMode)); }, [isComparisonMode]);
  useEffect(() => { localStorage.setItem('unimage_left_panel_width', leftPanelWidth.toString()); }, [leftPanelWidth]);
  useEffect(() => { setImageZoom({ scale: 1, panX: 0, panY: 0 }); }, [displayImage, state.generatedImage]);

  // Divider Drag Handlers
  useEffect(() => {
    if (!isDraggingDivider) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPanelWidth(Math.min(75, Math.max(25, newWidth)));
    };
    const handleMouseUp = () => setIsDraggingDivider(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isDraggingDivider]);

  useEffect(() => {
    if (!isDraggingRightDivider) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      const newWidth = rect.right - e.clientX;
      setRightPanelWidth(Math.min(500, Math.max(200, newWidth)));
      localStorage.setItem('unimage_right_panel_width', newWidth.toString());
    };
    const handleMouseUp = () => setIsDraggingRightDivider(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isDraggingRightDivider]);

  // Global Pipeline Trigger (e.g. from Auditor Tab)
  useEffect(() => {
    if (state.isProcessing && !isPipelineRunning.current && !state.isVideoMode) {
        actions.processImagePipeline(setShowProgressView);
    }
  }, [state.isProcessing]);

  // Add event listener for chat toggle from Studio
  useEffect(() => {
      const handler = () => chatSession.setIsDrawerOpen(prev => !prev);
      window.addEventListener('toggle-chat-drawer', handler);
      return () => window.removeEventListener('toggle-chat-drawer', handler);
  }, []);

  if (showLanding) return <LandingPage onEnterApp={() => setShowLanding(false)} hasKey={hasKey} onSelectKey={() => Promise.resolve(setIsKeyModalOpen(true))} />;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black text-stone-900 dark:text-stone-200 font-sans selection:bg-stone-200 dark:selection:bg-stone-700 overflow-hidden transition-colors duration-300 animate-in fade-in zoom-in-95 duration-1000">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <DocumentationModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
      <PromptLabModal isOpen={isPromptLabOpen} onClose={() => setIsPromptLabOpen(false)} />

      {/* Fullscreen Overlay */}
      {fullscreenImg && (
        <div className="fixed inset-0 z-[200] bg-white/95 dark:bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => { setFullscreenImg(null); setIsFullscreenComparison(false); }}>
          <button onClick={(e) => { e.stopPropagation(); setFullscreenImg(null); setIsFullscreenComparison(false); }} className="absolute top-10 right-10 p-4"><Icons.X size={32} /></button>
          {isFullscreenComparison ? (
             <div className="w-full h-full flex items-center justify-center gap-8 p-20">
               <img src={displayImage || ''} className="max-w-[45%] max-h-[85vh] object-contain" />
               <img src={`data:image/png;base64,${state.generatedImages[state.selectedHistoryIndex]}`} className="max-w-[45%] max-h-[85vh] object-contain" />
             </div>
          ) : (
             <div className="w-full h-full flex items-center justify-center p-10">
               <img src={fullscreenImg} className="max-w-[95%] max-h-[95%] object-contain" />
             </div>
          )}
        </div>
      )}

      {/* Header */}
      <AppHeader
        pipelineProgress={pipelineControl.progress}
        setIsPromptLabOpen={setIsPromptLabOpen}
        setIsHelpOpen={setIsHelpOpen}
        onHistoryClick={() => setState(prev => ({ ...prev, isHistoryOpen: !prev.isHistoryOpen }))}
        soundEnabled={soundEnabled}
        onToggleSound={() => { setSoundEnabled(!soundEnabled); soundService.setEnabled(!soundEnabled); }}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        apiMode={apiMode}
        hasKey={hasKey}
        onSelectKey={() => setIsKeyModalOpen(true)}
        onLogoClick={() => setShowLanding(true)}
      />

      <main ref={mainRef} className={`fixed top-24 bottom-28 left-8 right-8 max-w-[1920px] mx-auto flex gap-0 z-0 ${(isDraggingDivider || isDraggingRightDivider) ? 'select-none' : ''}`}>
        
        {/* Left Panel */}
        <LeftPanel
          width={leftPanelWidth}
          state={state}
          displayImage={displayImage}
          imageZoom={imageZoom}
          isComparisonMode={isComparisonMode}
          setState={setState}
          setIsComparisonMode={setIsComparisonMode}
          setFullscreenImg={setFullscreenImg}
          setIsFullscreenComparison={setIsFullscreenComparison}
          handleFileSelected={actions.handleFileSelected}
          handleProductFileSelected={actions.handleProductFileSelected}
          handleDownloadHD={actions.handleDownloadHD}
          handleZoomChange={setImageZoom}
          handleReset={actions.handleReset}
          showToast={showToast}
        />

        {/* Divider */}
        <div
          onMouseDown={() => setIsDraggingDivider(true)}
          className={`w-2 cursor-col-resize flex items-center justify-center group hover:bg-stone-200 dark:hover:bg-stone-700/50 transition-colors ${isDraggingDivider ? 'bg-orange-500/30' : ''}`}
        >
          <div className={`w-0.5 h-12 rounded-full transition-colors ${isDraggingDivider ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700 group-hover:bg-stone-400 dark:group-hover:bg-stone-500'}`} />
        </div>

        {/* Right Panel (Workbench) */}
        <RightPanel
          width={100 - leftPanelWidth}
          activeTab={activeTab}
          setActiveTab={(t) => setActiveTab(t as TabType)}
          state={state}
          setState={setState}
          pipelineProgress={pipelineControl.progress}
          onRegenerateAgent={(role) => {
              // Simple single-agent regenerate
              if(state.image && !state.isProcessing) {
                  // In a real app, you might want to move this detailed logic to hook too
                  // For now, assume it works if we trigger processing or specific stream
                  showToast("Use Pipeline for full regen", "info");
              }
          }}
          onStartPipeline={() => setState(prev => ({ ...prev, isProcessing: true }))}
          showToast={showToast}
          promptStudioProps={{
            aiInput, setAiInput, isAnalyzing, isChatProcessing: chatSession.isProcessing, reverseMode, setReverseMode, activeModelName,
            onToggleLanguage: () => actions.handleToggleLanguage(currentLang, setCurrentLang),
            onGenerateImage: actions.handleGenerateImage,
            onChatSendMessage: (msg: string) => chatSession.sendMessage(msg, { image: state.image, generatedImage: state.generatedImage, editablePrompt: state.editablePrompt, mimeType: state.mimeType }),
            onSmartAnalysis: executeSmartAnalysis,
            onCancelAnalysis: () => { pipelineControl.resetPipeline(); setShowProgressView(false); setState(prev => ({...prev, isProcessing: false})); },
            onVideoDirectorAnalysis: () => actions.handleVideoDirectorAnalysis(setShowProgressView),
            onQuickReverse: () => {}, // TODO: Implement quick reverse in useStudioLogic if needed
            onStartPipeline: () => setState(prev => ({ ...prev, isProcessing: true }))
          }}
        />

        {/* History Column Overlay */}
        {state.isHistoryOpen && (
           <>
             <div onMouseDown={() => setIsDraggingRightDivider(true)} className="w-2 cursor-col-resize flex items-center justify-center group hover:bg-stone-200"><div className="w-0.5 h-12 bg-stone-300 rounded-full" /></div>
             <div style={{ width: rightPanelWidth }} className="flex-shrink-0 flex flex-col bg-white dark:bg-stone-900 border rounded-xl overflow-hidden">
                <div className="p-4 border-b flex justify-between"><h3 className="font-bold">历史记录</h3><button onClick={()=>setState(p=>({...p, isHistoryOpen:false}))}><Icons.X size={14}/></button></div>
                <div className="flex-1 overflow-y-auto p-2">
                    {state.history.map((h, i) => (
                        <div key={h.id} className="p-2 mb-2 bg-stone-50 dark:bg-stone-800 rounded cursor-pointer" onClick={() => actions.loadHistoryItem(i)}>
                            <img src={`data:${h.mimeType};base64,${h.originalImage}`} className="w-10 h-10 object-cover rounded inline-block mr-2" />
                            <span className="text-xs">{new Date(h.timestamp).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
             </div>
           </>
        )}

        {/* Chat Drawer Overlay */}
        {chatSession.isDrawerOpen && (
            <div style={{ width: rightPanelWidth }} className="flex-shrink-0 flex flex-col bg-white dark:bg-stone-900 border rounded-xl ml-2">
                 <div className="p-4 border-b flex justify-between"><h3 className="font-bold">AI Assistant</h3><button onClick={()=>chatSession.setIsDrawerOpen(false)}><Icons.X size={14}/></button></div>
                 <div className="flex-1 p-4 overflow-y-auto">
                    {chatSession.messages.map(m => <div key={m.id} className={`mb-2 text-xs p-2 rounded ${m.role === 'user' ? 'bg-stone-100 dark:bg-stone-800' : 'text-blue-600'}`}>{m.content}</div>)}
                 </div>
            </div>
        )}

      </main>

      {/* Bottom Bar */}
      <HistoryBottomBar
        generatedImages={state.generatedImages}
        selectedHistoryIndex={state.selectedHistoryIndex}
        onLoadHistoryItem={actions.loadHistoryItem}
        onDeleteHistoryItem={actions.handleDeleteHistoryItem}
      />
    </div>
  );
};

export default App;