/**
 * 文件名: Workbench.tsx
 * 功能: 右侧工作台组件，用于显示 Prompt 编辑器、分析日志和交互操作。
 * 核心逻辑:
 * 1. 渲染 Markdown 格式的聊天历史。
 * 2. 处理用户输入指令和快捷操作。
 * 3. 集成 "逆向"、"生成"、"复制"、"历史" 等核心功能按钮。
 */

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AgentRole, AnalysisState, ChatMessage } from '../../../types';
import { Copy, History, Send, Wand2, Play, Sparkles, Plus, Box, Quote } from 'lucide-react';
import { AGENTS } from '../../../constants';

interface WorkbenchProps {
  chatHistory: ChatMessage[];
  analysisState: AnalysisState;
  onAnalyze: () => void;
  isImageLoaded: boolean;
}

const Workbench: React.FC<WorkbenchProps> = ({ 
  chatHistory, 
  analysisState, 
  onAnalyze, 
  isImageLoaded
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  // 自动滚动到聊天底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="h-full flex flex-col bg-[#0c0a09] relative">
      {/* 头部 / 标签页 */}
      <div className="h-12 border-b border-[#222] flex items-center justify-between px-4">
        <div className="flex items-center gap-1 text-xs font-semibold text-gray-400">
           <span>WORKBENCH</span>
        </div>
        
        <div className="flex bg-[#1a1a1a] rounded p-0.5">
            <button className="bg-[#333] text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                <span className="text-gray-400">🏷️</span> STUDIO
            </button>
            <button className="text-gray-500 hover:text-gray-300 text-[10px] px-3 py-1">场景</button>
            <button className="text-gray-500 hover:text-gray-300 text-[10px] px-3 py-1">材质</button>
            <button className="text-gray-500 hover:text-gray-300 text-[10px] px-3 py-1">构图</button>
        </div>
      </div>

      {/* 子头部操作 */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[#1a1a1a]">
        <div>
            <h2 className="text-white font-semibold text-sm font-serif">Prompt Studio</h2>
            <p className="text-[10px] text-gray-500 font-mono">提示词编辑器</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-[#1c1917] hover:bg-[#292524] text-gray-300 text-[10px] px-3 py-1.5 rounded transition-colors border border-[#292524]">完整分析</button>
            <button className="bg-[#1c1917] hover:bg-[#292524] text-gray-500 text-[10px] px-3 py-1.5 rounded transition-colors border border-[#292524]">快速逆向</button>
            <button className="bg-[#1c1917] hover:bg-[#292524] text-gray-300 text-[10px] px-3 py-1.5 rounded flex items-center gap-1 border border-[#292524]">
                Standard Mode <span className="ml-1 text-[8px]">▼</span>
            </button>
        </div>
      </div>

      {/* 主要内容区域 (聊天/日志) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 font-mono text-sm scroll-smooth"
      >
        {chatHistory.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
               <p className="font-serif italic">输入提示词，或上传图片逆向生成...</p>
           </div>
        ) : (
            chatHistory.map((msg) => (
                <div key={msg.id} className="animate-fade-in">
                    {msg.role === 'model' ? (
                        <div className="flex gap-4">
                           {/* 头像/图标逻辑可在此处基于 msg.agent 添加 */}
                           <div className="flex-1 text-gray-300 leading-relaxed markdown-content">
                                {msg.agent && (
                                    <div className={`text-[10px] uppercase tracking-wider mb-2 font-bold ${AGENTS[msg.agent].color.replace('bg-', 'text-')}`}>
                                        {AGENTS[msg.agent].name}
                                    </div>
                                )}
                                <ReactMarkdown
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mb-2 mt-4 font-serif" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-base font-bold text-orange-400 mb-2 mt-4 font-serif" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-blue-400 mb-2 mt-3" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-2" {...props} />,
                                        li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                                        code: ({node, ...props}) => <code className="bg-[#1c1917] px-1 py-0.5 rounded text-orange-300 text-xs font-mono" {...props} />,
                                        pre: ({node, ...props}) => <pre className="bg-[#0f0f0f] p-3 rounded border border-[#292524] overflow-x-auto my-2" {...props} />
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                           </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 italic mb-2 border-b border-[#222] pb-2 text-xs">
                            User Request: {msg.content}
                        </div>
                    )}
                </div>
            ))
        )}
        
        {analysisState.isAnalyzing && (
            <div className="flex items-center gap-2 text-orange-500 text-xs animate-pulse">
                <Sparkles size={14} />
                <span>Processing Step {analysisState.currentStep + 1}...</span>
            </div>
        )}
      </div>

      {/* 操作栏 */}
      <div className="px-6 pb-2">
         <div className="flex gap-2">
            <button 
                onClick={onAnalyze}
                disabled={!isImageLoaded || analysisState.isAnalyzing}
                className={`flex-1 flex items-center justify-center gap-2 bg-[#1c1917] hover:bg-[#292524] text-gray-400 hover:text-white py-2 rounded text-xs transition-colors border border-[#292524] ${!isImageLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Wand2 size={14} />
                逆向 (Reverse)
            </button>
            <button className="flex-[3] flex items-center justify-center gap-2 bg-gray-200 hover:bg-white text-black font-semibold py-2 rounded text-xs transition-colors">
                <Play size={14} fill="currentColor" />
                生成 (Generate)
            </button>
            <button className="px-3 bg-[#1c1917] hover:bg-[#292524] text-gray-400 rounded flex items-center gap-1 text-xs border border-[#292524]">
                <Copy size={14} />
                复制
            </button>
            <button className="px-3 bg-[#1c1917] hover:bg-[#292524] text-gray-400 rounded flex items-center gap-1 text-xs border border-[#292524]">
                <History size={14} />
                历史
            </button>
         </div>
      </div>

      {/* 输入区域 */}
      <div className="p-4 pt-2">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-3 flex flex-col gap-2">
            <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入 AI 指令..."
                className="bg-transparent border-none outline-none text-sm text-gray-300 resize-none h-12 w-full placeholder-gray-600 font-mono"
            />
            <div className="flex items-center justify-between text-[10px] text-gray-500">
                <div className="flex items-center gap-2">
                    <button className="hover:text-white"><Plus size={12} /></button>
                    <span>Gemini 2.5 Flash</span>
                </div>
                <div className="flex items-center gap-2">
                     <button className="p-1 hover:bg-[#333] rounded text-purple-400"><Sparkles size={12} /></button>
                     <button className="p-1 hover:bg-[#333] rounded text-white bg-[#333]"><Send size={12} /></button>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Workbench;