/**
 * 文件名: DocOverlay.tsx
 * 功能: 文档覆盖层组件 (旧版/备用)。
 * 核心逻辑:
 * 1. 提供分章节的文档导航。
 * 2. 渲染静态的文档内容（快速开始、核心概念等）。
 * 3. 作为全屏模态框显示帮助信息。
 */

import React, { useState } from 'react';
import { DocPage } from '../types';
import { X, Play, Zap, RefreshCcw, PenTool, FileImage, Layout, ShieldCheck } from 'lucide-react';

interface DocOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { section: 'GETTING STARTED', items: [
    { id: 'quick-start', title: '快速开始', icon: <Play size={18} /> },
    { id: 'concepts', title: '核心概念', icon: <Zap size={18} /> },
  ]},
  { section: 'FEATURES', items: [
    { id: 'pipeline', title: '逆向流水线', icon: <RefreshCcw size={18} /> },
    { id: 'prompt-studio', title: '提示词工作室', icon: <PenTool size={18} /> },
    { id: 'image-gen', title: '图像生成', icon: <FileImage size={18} /> },
  ]},
  { section: 'ADVANCED', items: [
    { id: 'style-ref', title: '风格与参考图', icon: <div className="border border-current rounded p-[1px]"><div className="w-2 h-2 bg-current rounded-full" /></div> },
    { id: 'layout', title: '蓝图解构', icon: <Layout size={18} /> },
    { id: 'qa', title: '质检与修复', icon: <ShieldCheck size={18} /> },
  ]},
];

const CONTENT: Record<DocPage, React.ReactNode> = {
  'quick-start': (
    <div>
      <h2 className="text-xl font-bold mb-6 text-white">快速开始 (Quick Start)</h2>
      <p className="mb-4 text-gray-300">欢迎来到 UnImage! 只需四步，即可完成您的第一次视觉逆向工程。</p>
      
      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <div>
          <h3 className="text-white font-medium mb-1">1. 配置 API Key (Config API Key)</h3>
          <p>在使用 UnImage 之前，您需要先配置 Gemini API Key。</p>
          <p>点击主界面右上角的 <span className="text-white font-bold">API Key</span> 设置图标。</p>
          <p>在弹出的窗口中粘贴您的 API Key。</p>
          <p>点击 <span className="text-white font-bold">Verify & Save</span> 保存。</p>
          <p className="text-gray-500 mt-1">如果您还没有 Key，可以前往 Google AI Studio 免费申请。</p>
        </div>

        <div>
          <h3 className="text-white font-medium mb-1">2. 上传图片 (Upload Image)</h3>
          <p>将您想要分析的图片<span className="text-white font-bold">拖拽</span>到主界面的上传区域，或者点击中间的<span className="text-white font-bold">上传图标</span>选择文件。</p>
          <p>支持 JPG, PNG, WEBP 等常见格式。</p>
        </div>

        <div>
          <h3 className="text-white font-medium mb-1">3. 启动分析 (Start Pipeline)</h3>
          <p>图片上传后，点击底部的 "<span className="text-white font-bold">开始分析</span>" (Start Pipeline) 按钮。系统会自动启动 4 个智能 Agent 对图片进行深度解构：</p>
          <ul className="list-none pl-0 mt-2 space-y-1">
             <li className="flex items-center gap-2"><span className="text-blue-400">🔍</span> <span className="text-white font-bold">审核员</span>: 检查图片内容</li>
             <li className="flex items-center gap-2"><span className="text-green-400">📝</span> <span className="text-white font-bold">描述员</span>: 提取视觉元素</li>
             <li className="flex items-center gap-2"><span className="text-orange-400">🏗️</span> <span className="text-white font-bold">架构师</span>: 分析构图结构</li>
             <li className="flex items-center gap-2"><span className="text-pink-400">🎨</span> <span className="text-white font-bold">合成师</span>: 生成绘画提示词</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-medium mb-1">4. 获取提示词 (Get Prompt)</h3>
          <p>等待进度条走完（通常需要 10-20 秒）。分析完成后，您可以在右侧的 <span className="text-white font-bold">提示词工作室 (Prompt Studio)</span> 中看到生成的 Prompt。</p>
          <p>点击 <span className="text-white font-bold">复制</span> 按钮，即可将提示词用于 Midjourney 或其他生图工具！</p>
        </div>
      </div>
    </div>
  ),
  'concepts': (
    <div>
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">🧩 核心概念</h2>
        <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
            <div>
                <h3 className="text-white font-medium mb-2">核心概念 (Core Concepts)</h3>
                <h4 className="text-gray-400 mb-1">什么是视觉逆向？</h4>
                <p>不同于简单的“图生文”，UnImage 采用<span className="text-white font-bold">物理逆向协议</span>。</p>
                <p>它不只是识别物体，而是像拆解蓝图一样，分析画面的光影、材质、透视和渲染技术，从而能还原出高度逼真的 Prompt。</p>
            </div>
            <div>
                <h4 className="text-gray-400 mb-1">Agent 协作</h4>
                <p>UnImage 并非单一模型，而是一个 <span className="text-white font-bold">Agent 团队</span>:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li><span className="text-white font-bold">Auditor</span>: 安全官，确保合规。</li>
                    <li><span className="text-white font-bold">Descriptor</span>: 视觉翻译官，将像素转化为文字。</li>
                    <li><span className="text-white font-bold">Architect</span>: 空间设计师，负责透视和构图。</li>
                    <li><span className="text-white font-bold">Synthesizer</span>: 最终的 Prompt 工程师，汇总所有信息。</li>
                </ul>
            </div>
        </div>
    </div>
  ),
  'pipeline': (
    <div>
       <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">🔄 逆向流水线</h2>
       <div className="text-sm text-gray-300 leading-relaxed">
           <p className="mb-4">逆向流水线 (Reverse Pipeline)</p>
           <h3 className="text-white font-medium mb-1">标准流水线</h3>
           <p className="mb-4">点击“开始分析”启动。这是最完整的分析流程，包含完整的 7 层物理逆向协议。适合：需要高精度还原、复杂构图的图片。</p>
           <h3 className="text-white font-medium mb-1">快速逆向 (Quick Reverse)</h3>
           <p className="mb-4">在生成按钮旁点击 ⚡ (闪电图标)。跳过部分深度分析步骤，仅提取核心视觉特征。适合：快速获取灵感、简单图片的分析。</p>
           <h3 className="text-white font-medium mb-1">进度视图</h3>
           <p>分析过程中，您可以实时看到每个 Agent 的思维过程。点击进度条上的节点，可以查看该 Agent 的详细输出报告。</p>
       </div>
    </div>
  ),
  'prompt-studio': (<div><h2 className="text-xl font-bold mb-4 text-white">提示词工作室</h2><p className="text-gray-400">此功能文档正在建设中。</p></div>),
  'image-gen': (<div><h2 className="text-xl font-bold mb-4 text-white">图像生成</h2><p className="text-gray-400">此功能文档正在建设中。</p></div>),
  'style-ref': (<div><h2 className="text-xl font-bold mb-4 text-white">风格与参考图</h2><p className="text-gray-400">此功能文档正在建设中。</p></div>),
  'layout': (<div><h2 className="text-xl font-bold mb-4 text-white">蓝图解构</h2><p className="text-gray-400">此功能文档正在建设中。</p></div>),
  'qa': (<div><h2 className="text-xl font-bold mb-4 text-white">质检与修复</h2><p className="text-gray-400">此功能文档正在建设中。</p></div>),
};

const DocOverlay: React.FC<DocOverlayProps> = ({ isOpen, onClose }) => {
  const [activePage, setActivePage] = useState<DocPage>('quick-start');

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111111] w-[90%] max-w-6xl h-[85vh] rounded-lg border border-[#333] flex overflow-hidden shadow-2xl relative">
        
        {/* 侧边栏 */}
        <div className="w-64 border-r border-[#222] bg-[#0c0c0c] flex flex-col h-full">
          <div className="p-6 border-b border-[#222]">
            <h2 className="text-orange-500 font-bold flex items-center gap-2">
              <span className="text-lg">?</span> 文档中心
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Documentation Center</p>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {MENU_ITEMS.map((section, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {section.section}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActivePage(item.id as DocPage)}
                      className={`w-full flex items-center gap-3 px-6 py-2.5 text-xs transition-colors ${
                        activePage === item.id 
                          ? 'bg-orange-600 text-white' 
                          : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                      }`}
                    >
                      <span className={`${activePage === item.id ? 'text-white' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-[#222] text-[10px] text-gray-600 text-center font-mono">
            UnImage v2.6.0 Enterprise
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 bg-[#111111] overflow-y-auto relative">
          <div className="sticky top-0 right-0 p-4 flex justify-end z-10">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#222] rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="px-12 py-8 max-w-3xl">
            {CONTENT[activePage]}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocOverlay;