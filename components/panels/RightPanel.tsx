/**
 * 文件名: RightPanel.tsx
 * 功能: 右侧面板组件，包含 Prompt 编辑器和 Agent 分析结果展示。
 * 核心逻辑:
 * 1. 管理标签页切换 (Studio vs Agents)。
 * 2. 渲染 PromptStudioView 或单个 AgentCard。
 * 3. 显示 Agent 分析状态和结果。
 */

import React from 'react';
import { PanelHeader } from '../PanelHeader';
import { Icons } from '../Icons';
import { AgentCard } from '../AgentCard';
import { PromptStudioView } from '../views/PromptStudioView';
import { AgentRole, AppState, PipelineProgress } from '../../types';
import { AGENTS } from '../../constants';

interface RightPanelProps {
  width: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  pipelineProgress: PipelineProgress | null;
  
  // PromptStudio Props
  promptStudioProps: any; // 为了简洁使用 any，但理想情况下应匹配 PromptStudioViewProps

  // Agent Actions
  onRegenerateAgent: (role: AgentRole) => void;
  onStartPipeline: () => void;
  showToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  width,
  activeTab,
  setActiveTab,
  state,
  setState,
  pipelineProgress,
  promptStudioProps,
  onRegenerateAgent,
  onStartPipeline,
  showToast
}) => {

  const renderTabContent = () => {
    if (activeTab === 'STUDIO') {
      return (
        <PromptStudioView 
          {...promptStudioProps}
          state={state}
          setState={setState}
          pipelineProgress={pipelineProgress}
          setActiveTab={setActiveTab}
        />
      );
    }

    const roleKey = activeTab as AgentRole;
    return (
      <div className="h-full overflow-y-auto p-4 custom-scrollbar">
        <AgentCard
          config={AGENTS[roleKey]}
          result={state.results[roleKey]}
          isActive={state.activeRole === activeTab}
          isPending={!state.results[roleKey]?.content}
          onRegenerate={() => onRegenerateAgent(roleKey)}
          onContentChange={(content) => setState(prev => ({
            ...prev,
            results: { ...prev.results, [activeTab]: { ...prev.results[roleKey], content } }
          }))}
          onCopy={() => {
            const content = state.results[roleKey]?.content;
            if (content) {
              navigator.clipboard.writeText(content);
              showToast('已复制', 'success');
            }
          }}
          onStartPipeline={activeTab === AgentRole.AUDITOR ? onStartPipeline : undefined}
        />
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden relative transition-colors duration-300">
      <PanelHeader title="Workbench">
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg transition-colors">
          {(state.isFusionMode 
            ? ['STUDIO', 'AUDITOR', 'DESCRIPTOR', 'ARCHITECT', 'SYNTHESIZER'] 
            : ['STUDIO', 'AUDITOR', 'DESCRIPTOR', 'ARCHITECT']
          ).map((tid) => {
            const isStudio = tid === 'STUDIO';
            const roleKey = isStudio ? AgentRole.SYNTHESIZER : tid as AgentRole;
            const iconName = isStudio ? 'PenTool' : AGENTS[roleKey]?.icon;
            const IconComponent = Icons[iconName as keyof typeof Icons];
            const result = state.results[roleKey];
            const currentStepIndex = pipelineProgress?.currentStepIndex ?? -1;
            const isCurrentStep = pipelineProgress?.steps[currentStepIndex]?.role === roleKey && pipelineProgress.isRunning;

            const tabLabels: Record<string, string> = {
              'STUDIO': 'Studio',
              'AUDITOR': '场景',
              'DESCRIPTOR': '材质',
              'ARCHITECT': '构图',
              'SYNTHESIZER': '融合'
            };

            return (
              <button
                key={tid}
                onClick={() => setActiveTab(tid as any)}
                className={`relative px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${activeTab === tid ? 'bg-white dark:bg-stone-600 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}
              >
                <div className={isCurrentStep ? 'text-blue-500 dark:text-blue-400 animate-pulse' : ''}>
                  {result?.isStreaming ? <Icons.RefreshCw size={12} className="animate-spin" /> : IconComponent && <IconComponent size={12} />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight">{tabLabels[tid]}</span>
                {result?.isComplete && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-white dark:border-stone-800" />}
              </button>
            );
          })}
        </div>
      </PanelHeader>

      <div className="flex-1 min-h-0 bg-white dark:bg-stone-900 relative transition-colors duration-300">
        {!state.image && activeTab !== 'STUDIO' ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-700 space-y-4">
            <Icons.Compass size={48} strokeWidth={1} className="animate-spin duration-10000 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">请先上传图片以使用分析功能</p>
          </div>
        ) : renderTabContent()}
      </div>
    </div>
  );
};