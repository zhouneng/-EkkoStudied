/**
 * 文件名: types.ts
 * 功能: 全局类型定义文件。
 * 核心逻辑:
 * 1. 定义 Agent 角色枚举 (AgentRole) 和配置接口。
 * 2. 定义聊天消息、分析状态、流水线步骤等核心数据结构。
 * 3. 定义应用全局状态接口 (AppState) 和历史记录项 (HistoryItem)。
 */

import React from 'react';

export enum AgentRole {
  AUDITOR = 'AUDITOR',
  DESCRIPTOR = 'DESCRIPTOR',
  ARCHITECT = 'ARCHITECT',
  SYNTHESIZER = 'SYNTHESIZER',
  CRITIC = 'CRITIC',
  SORA_VIDEOGRAPHER = 'SORA_VIDEOGRAPHER'
}

export interface AgentConfig {
  id: AgentRole;
  name: string;
  icon: string;
  description: string;
  color: string;
  systemInstruction: string;
}

export type SkillType = 'quality-check' | 'refine' | 'reverse' | 'translate' | 'generate' | 'other';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system' | 'assistant' | 'skill-result';
  content: string;
  agent?: AgentRole;
  timestamp: number;
  isStreaming?: boolean;
  skillType?: SkillType;
  suggestions?: string[];
  selectedIndices?: number[];
  applied?: boolean;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  currentStep: number; 
  progress: number; // 0-100
}

export interface AnalysisResult {
  isComplete: boolean;
  content: string;
  isStreaming?: boolean;
}

export type DocSection = 'start' | 'features' | 'advanced';
export type DocPage = 'quick-start' | 'concepts' | 'pipeline' | 'prompt-studio' | 'image-gen' | 'style-ref' | 'layout' | 'qa';

export interface DocItem {
  id: DocPage;
  title: string;
  icon: React.ReactNode;
}

export interface LayoutElement {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  label: string;
  hierarchy: 'Primary' | 'Secondary' | 'Tertiary' | string;
}

export enum PipelineStepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface PipelineStep {
  name: string;
  role: string;
  status: PipelineStepStatus;
  progress: number;
  description: string;
  streamingContent: string;
  finalContent: string;
  error?: string;
  startTime?: number;
  endTime?: number | null;
}

export interface PipelineProgress {
  isRunning: boolean;
  totalProgress: number;
  estimatedTimeRemaining?: number;
  steps: PipelineStep[];
  currentStepIndex?: number;
  startTime?: number;
}

export interface ReferenceImage {
  id: string;
  url: string;
  name: string;
  mimeType?: string;
  aspectRatio?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalImage: string;
  mimeType: string;
  prompt: string;
  generatedImage?: string;
  detectedAspectRatio?: string;
  referenceImages?: ReferenceImage[];
  isFusionMode?: boolean;
  productImage?: string;
}

export interface AppState {
  image: string | null;
  displayImage?: string | null;
  mimeType: string;
  
  // Fusion Mode State
  isFusionMode: boolean;
  productImage: string | null;
  productMimeType: string;
  
  // Video Prompt Mode State
  isVideoMode: boolean;

  isProcessing: boolean;
  activeRole: AgentRole | null;
  results: Record<AgentRole, AnalysisResult>;
  generatedImage: string | null;
  generatedImages: string[];
  isGeneratingImage: boolean;
  editablePrompt: string;
  promptHistory: string[];
  currentPromptIndex: number;
  isRefiningPrompt: boolean;
  useReferenceImage: boolean;
  isTemplatizing: boolean;
  detectedAspectRatio: string;
  videoAnalysisDuration: number | null;
  isRefining: boolean;
  history: HistoryItem[];
  isHistoryOpen: boolean;
  isVersionDropdownOpen: boolean;
  layoutData: LayoutElement[] | null;
  isAnalyzingLayout: boolean;
  suggestions: string[];
  selectedSuggestionIndices: number[];
  promptCache: { CN: string; EN: string };
  selectedHistoryIndex: number;
  referenceImages: ReferenceImage[];
  isComparing: boolean;
  activeTab: string;
}