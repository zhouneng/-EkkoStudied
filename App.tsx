import React, { useState, useEffect } from 'react';
import { ToastMessage, ToastType } from './components/ToastContainer';
import { Icons } from './components/Icons';
import { executeSmartAnalysis } from './services/geminiService';
import { soundService } from './services/soundService';
import { usePipelineProgress } from './hooks/usePipelineProgress';
import { useAppInit } from './hooks/useAppInit';
import { useChatSession } from './hooks/useChatSession';
import { useStudioLogic, INITIAL_STATE } from './hooks/useStudioLogic';
import { usePanelResizer } from './hooks/usePanelResizer';
import { AgentRole } from './types';
import { LandingPage } from './components/LandingPage';
import { ImageZoomState } from './utils/zoom';

// Components
import { AppHeader } from './components/AppHeader';
import { HistoryBottomBar } from './components/HistoryBottomBar';
import { LeftPanel } from './components/panels/LeftPanel';
import { RightPanel } from './components/panels/RightPanel';
import { AppOverlays } from './components/AppOverlays';

type TabType = AgentRole.AUDITOR | AgentRole.DESCRIPTOR | AgentRole.ARCHITECT | AgentRole.SYNTHESIZER | AgentRole.SORA_VIDEOGRAPHER | 'STUDIO';

const App: React.FC = () => {
  // 1. Initialization
  const { 
    showLanding, setShowLanding, hasKey, theme, setTheme, apiMode, activeModelName, initialAppState, initialDisplayImage 
  } = useAppInit(INITIAL_STATE);

  // 2. UI State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isPromptLabOpen, setIsPromptLabOpen] = useState(false);
  
  // UI Preferences
  const [isComparisonMode, setIsComparisonMode] = useState(() => JSON.parse(localStorage.getItem('unimage_comparison_mode') || 'false'));
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const [isFullscreenComparison, setIsFullscreenComparison] = useState(false);
  const [imageZoom, setImageZoom] = useState<ImageZoomState>({ scale: 1, panX: 0, panY: 0 });
  const [showProgressView, setShowProgressView] = useState(false);

  // Prompt Studio Specific UI State
  const [currentLang, setCurrentLang] = useState<'CN' | 'EN'>('CN');
  const [aiInput, setAiInput] = useState('');
  const [reverseMode, setReverseMode] = useState<'full' | 'quick'>('quick');

  // 3. Logic Hooks
  const {
    leftPanelWidth,
    rightPanelWidth,
    isDraggingDivider,
    isDraggingRightDivider,
    setIsDraggingDivider,
    setIsDraggingRightDivider,
    mainRef
  } = usePanelResizer();

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

  // 4. Effects
  useEffect(() => { localStorage.setItem('unimage_comparison_mode', JSON.stringify(isComparisonMode)); }, [isComparisonMode]);
  useEffect(() => { setImageZoom({ scale: 1, panX: 0, panY: 0 }); }, [displayImage, state.generatedImage]);

  // Global Pipeline Trigger
  useEffect(() => {
    if (state.isProcessing && !isPipelineRunning.current && !state.isVideoMode) {
        actions.processImagePipeline(setShowProgressView);
    }
  }, [state.isProcessing]);

  // Chat toggle event listener
  useEffect(() => {
      const handler = () => chatSession.setIsDrawerOpen(prev => !prev);
      window.addEventListener('toggle-chat-drawer', handler);
      return () => window.removeEventListener('toggle-chat-drawer', handler);
  }, []);

  if (showLanding) return <LandingPage onEnterApp={() => setShowLanding(false)} hasKey={hasKey} onSelectKey={() => Promise.resolve(setIsKeyModalOpen(true))} />;

  // Context Object for Prompt Studio
  const promptStudioContext = {
    aiInput, setAiInput,
    isAnalyzing: state.isProcessing, // Using isProcessing as generic analyzing state
    isChatProcessing: chatSession.isProcessing,
    reverseMode, setReverseMode,
    activeModelName,
    onToggleLanguage: () => actions.handleToggleLanguage(currentLang, setCurrentLang),
    onGenerateImage: actions.handleGenerateImage,
    onChatSendMessage: (msg: string) => chatSession.sendMessage(msg, { image: state.image, generatedImage: state.generatedImage, editablePrompt: state.editablePrompt, mimeType: state.mimeType }),
    onSmartAnalysis: executeSmartAnalysis,
    onCancelAnalysis: () => { pipelineControl.resetPipeline(); setShowProgressView(false); setState(prev => ({...prev, isProcessing: false})); },
    onVideoDirectorAnalysis: () => actions.handleVideoDirectorAnalysis(setShowProgressView),
    onQuickReverse: () => {}, 
    onStartPipeline: () => setState(prev => ({ ...prev, isProcessing: true }))
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black text-stone-900 dark:text-stone-200 font-sans selection:bg-stone-200 dark:selection:bg-stone-700 overflow-hidden transition-colors duration-300 animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Aggregated Overlays */}
      <AppOverlays
        toasts={toasts}
        removeToast={removeToast}
        isHelpOpen={isHelpOpen}
        setIsHelpOpen={setIsHelpOpen}
        isKeyModalOpen={isKeyModalOpen}
        setIsKeyModalOpen={setIsKeyModalOpen}
        isPromptLabOpen={isPromptLabOpen}
        setIsPromptLabOpen={setIsPromptLabOpen}
        fullscreenImg={fullscreenImg}
        setFullscreenImg={setFullscreenImg}
        isFullscreenComparison={isFullscreenComparison}
        setIsFullscreenComparison={setIsFullscreenComparison}
        displayImage={displayImage}
        generatedImage={state.generatedImages[state.selectedHistoryIndex]}
      />

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
              // Simple single-agent regenerate stub
              if(state.image && !state.isProcessing) {
                  showToast("Use Pipeline for full regen", "info");
              }
          }}
          onStartPipeline={() => setState(prev => ({ ...prev, isProcessing: true }))}
          showToast={showToast}
          promptStudioProps={promptStudioContext}
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