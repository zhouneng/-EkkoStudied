
import React, { useState } from 'react';
import { Icons } from '../Icons';
import { PanelHeader } from '../PanelHeader';
import { ImageUploader } from '../ImageUploader';
import { ImageViewer } from '../ImageViewer';
import { ImageComparisonSlider } from '../ImageComparisonSlider';
import { AppState } from '../../types';
import { ImageZoomState } from '../../utils/zoom';

interface LeftPanelProps {
  width: number;
  state: AppState;
  displayImage: string | null;
  imageZoom: ImageZoomState;
  isComparisonMode: boolean;
  
  // Actions
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setIsComparisonMode: (mode: boolean) => void;
  setFullscreenImg: (img: string | null) => void;
  setIsFullscreenComparison: (isComparison: boolean) => void;
  handleFileSelected: (base64: string, aspectRatio: string, mimeType: string, duration?: number) => void;
  handleProductFileSelected: (base64: string, aspectRatio: string, mimeType: string) => void;
  handleDownloadHD: (index: number) => void;
  handleZoomChange: (newZoom: ImageZoomState) => void;
  handleReset: () => void;
  showToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

// Helper to determine image source
const getImageSrc = (data: string | null | undefined, mimeType: string = 'image/png') => {
  if (!data) return '';
  if (data.startsWith('http')) return data;
  if (data.startsWith('data:')) return data;
  return `data:${mimeType};base64,${data}`;
};

export const LeftPanel: React.FC<LeftPanelProps> = ({
  width,
  state,
  displayImage,
  imageZoom,
  isComparisonMode,
  setState,
  setIsComparisonMode,
  setFullscreenImg,
  setIsFullscreenComparison,
  handleFileSelected,
  handleProductFileSelected,
  handleDownloadHD,
  handleZoomChange,
  handleReset,
  showToast
}) => {
  // Local drag states for specific drop zones
  const [isDraggingScene, setIsDraggingScene] = useState(false);
  const [isDraggingProduct, setIsDraggingProduct] = useState(false);
  const [isDraggingNewImage, setIsDraggingNewImage] = useState(false);

  const handleDropFile = (e: React.DragEvent, callback: (base64: string, ratio: string, mime: string) => void) => {
    e.preventDefault();
    e.stopPropagation();
    const files = (Array.from(e.dataTransfer.files) as File[]).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const cleanBase64 = result.split(',')[1];
        
        const img = new Image();
        img.onload = () => {
            const ratio = img.naturalWidth / img.naturalHeight;
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
            callback(cleanBase64, closest.id, file.type);
        };
        img.src = result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ width: `${width}%` }} className="flex flex-col h-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm transition-colors duration-300">
      <PanelHeader title="Visual Assets">
        <div className="flex items-center gap-2">
          {/* Fusion Mode Toggle */}
          <button
            onClick={() => setState(prev => ({ ...prev, isFusionMode: !prev.isFusionMode }))}
            className={`p-1.5 transition-colors rounded-lg flex items-center gap-2 border ${state.isFusionMode 
              ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700' 
              : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={state.isFusionMode ? "退出产品融合模式" : "开启产品融合模式"}
          >
            <Icons.Layers size={14} />
            {state.isFusionMode && <span className="text-[10px] font-bold">FUSION MODE</span>}
          </button>

          <div className="w-px h-4 bg-stone-200 dark:bg-stone-700 mx-1" />

          {/* Video Prompt Toggle */}
          <button
            onClick={() => setState(prev => ({ ...prev, isVideoMode: !prev.isVideoMode }))}
            className={`p-1.5 transition-colors rounded-lg flex items-center gap-2 border ${state.isVideoMode
              ? 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700'
              : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={state.isVideoMode ? "退出 AI Video Prompt 模式" : "开启 AI Video Prompt 模式"}
          >
            <Icons.Film size={14} />
            {state.isVideoMode && <span className="text-[10px] font-bold">VIDEO PROMPT</span>}
          </button>

          <div className="w-px h-4 bg-stone-200 dark:bg-stone-700 mx-1" />

          {state.generatedImages.length > 0 && (
            <>
              <div className="flex items-center gap-2 mr-2 border-r border-stone-200 dark:border-stone-800 pr-3">
                <span className={`text-[9px] font-bold uppercase transition-colors ${isComparisonMode ? 'text-orange-500' : 'text-stone-400 dark:text-stone-500'}`}>Compare</span>
                <button
                  onClick={() => setIsComparisonMode(!isComparisonMode)}
                  className={`w-7 h-4 rounded-full transition-colors flex items-center p-0.5 ${isComparisonMode ? 'bg-orange-500' : 'bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${isComparisonMode ? 'translate-x-3' : 'translate-x-0'}`} />
                </button>
              </div>

              <button
                onClick={() => handleDownloadHD(state.selectedHistoryIndex)}
                className="p-1.5 text-stone-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                title="Download HD"
              >
                <Icons.Download size={14} />
              </button>
            </>
          )}
          <button
            onClick={handleReset}
            className="p-1.5 text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
            title="New Task"
          >
            <Icons.Plus size={14} />
          </button>
        </div>
      </PanelHeader>

      {/* Upload Area */}
      <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        {state.isFusionMode ? (
          // Fusion Mode: Split View for Two Images - Forced 50/50 split
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Scene Reference */}
            <div className="flex-1 basis-1/2 min-h-0 flex flex-col border-b border-stone-200 dark:border-stone-800 relative overflow-hidden">
                <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    Scene Reference
                </div>
                {state.image ? (
                    <div 
                        className={`w-full h-full relative overflow-hidden bg-stone-50 dark:bg-stone-900 flex items-center justify-center transition-colors ${isDraggingScene ? 'bg-orange-50 dark:bg-orange-900/20 ring-2 ring-inset ring-orange-500' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingScene(true); }}
                        onDragLeave={() => setIsDraggingScene(false)}
                        onDrop={(e) => {
                            setIsDraggingScene(false);
                            handleDropFile(e, (base64, ratio, mime) => handleFileSelected(base64, ratio, mime));
                        }}
                    >
                        <img src={getImageSrc(state.image, state.mimeType)} className="max-w-full max-h-full object-contain p-4 pointer-events-none" alt="Scene" />
                        {isDraggingScene && (
                            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
                                <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-xl">
                                    <Icons.RefreshCw size={14} /> 替换场景图
                                </div>
                            </div>
                        )}
                        <button 
                            onClick={() => setState(prev => ({ ...prev, image: null }))}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-rose-500 transition-colors z-20"
                        >
                            <Icons.X size={12} />
                        </button>
                    </div>
                ) : (
                    <ImageUploader onImageSelected={handleFileSelected} disabled={state.isProcessing} />
                )}
            </div>
            
            {/* Product Reference */}
            <div className="flex-1 basis-1/2 min-h-0 flex flex-col relative overflow-hidden">
                <div className="absolute top-2 left-2 z-10 bg-purple-600/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    Product Reference
                </div>
                {state.productImage ? (
                    <div 
                        className={`w-full h-full relative overflow-hidden bg-stone-50 dark:bg-stone-900 flex items-center justify-center transition-colors ${isDraggingProduct ? 'bg-orange-50 dark:bg-orange-900/20 ring-2 ring-inset ring-orange-500' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingProduct(true); }}
                        onDragLeave={() => setIsDraggingProduct(false)}
                        onDrop={(e) => {
                            setIsDraggingProduct(false);
                            handleDropFile(e, (base64, ratio, mime) => handleProductFileSelected(base64, ratio, mime));
                        }}
                    >
                        <img src={getImageSrc(state.productImage, state.productMimeType)} className="max-w-full max-h-full object-contain p-4 pointer-events-none" alt="Product" />
                        {isDraggingProduct && (
                            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
                                <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-xl">
                                    <Icons.RefreshCw size={14} /> 替换产品图
                                </div>
                            </div>
                        )}
                        <button 
                            onClick={() => setState(prev => ({ ...prev, productImage: null }))}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-rose-500 transition-colors z-20"
                        >
                            <Icons.X size={12} />
                        </button>
                    </div>
                ) : (
                    <ImageUploader onImageSelected={handleProductFileSelected} disabled={state.isProcessing} />
                )}
            </div>
          </div>
        ) : (
          // Standard Mode: Single Image Logic
          <div
            className={`flex-1 flex flex-col h-full ${isDraggingNewImage ? 'ring-2 ring-orange-500 ring-inset' : ''}`}
            onDragOver={(e) => {
              if (displayImage) {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingNewImage(true);
              }
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingNewImage(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingNewImage(false);

              if (!displayImage) return;

              const files = (Array.from(e.dataTransfer.files) as File[]).filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));
              if (files.length === 0) return;

              const file = files[0];
              if (file.size > 20 * 1024 * 1024) {
                showToast('文件过大 (最大 20MB)', 'error');
                return;
              }

              const reader = new FileReader();
              reader.onload = (ev) => {
                const base64String = ev.target?.result as string;
                const cleanBase64 = base64String.split(',')[1];
                const mimeType = file.type;

                // Calculate aspect ratio
                if (file.type.startsWith('image/')) {
                  const img = new Image();
                  img.onload = () => {
                    const ratio = img.naturalWidth / img.naturalHeight;
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
                    handleFileSelected(cleanBase64, closest.id, mimeType);
                    showToast('已加载新图片', 'success');
                  };
                  img.src = base64String;
                } else {
                  handleFileSelected(cleanBase64, '16:9', mimeType);
                  showToast('已加载新视频', 'success');
                }
              };
              reader.readAsDataURL(file);
            }}
          >
            {/* Drag overlay */}
            {isDraggingNewImage && displayImage && (
              <div className="absolute inset-0 z-50 bg-orange-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                <div className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl">
                  <Icons.Upload size={18} />
                  拖放以开始新的逆向
                </div>
              </div>
            )}

            {!displayImage ? (
              <ImageUploader onImageSelected={handleFileSelected} disabled={state.isProcessing} />
            ) : (
              <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
                {state.generatedImages.length > 0 && state.selectedHistoryIndex !== -1 ? (
                  isComparisonMode ? (
                    <ImageComparisonSlider
                      beforeImage={displayImage}
                      afterImage={getImageSrc(state.generatedImages[state.selectedHistoryIndex])}
                      className="w-full h-full border-0 rounded-none bg-stone-50/50 dark:bg-stone-950/50"
                      layoutData={state.layoutData}
                      isAnalyzingLayout={state.isAnalyzingLayout}
                      onFullscreen={() => { setFullscreenImg(displayImage); setIsFullscreenComparison(true); }}
                      zoom={imageZoom}
                      onZoomChange={handleZoomChange}
                    />
                  ) : (
                    <ImageViewer
                      src={getImageSrc(state.generatedImages[state.selectedHistoryIndex])}
                      alt="Generated Result"
                      className="w-full h-full border-0 rounded-none bg-stone-50/50 dark:bg-stone-950/50"
                      layoutData={state.layoutData}
                      isAnalyzingLayout={state.isAnalyzingLayout}
                      onFullscreen={() => setFullscreenImg(getImageSrc(state.generatedImages[state.selectedHistoryIndex]))}
                      zoom={imageZoom}
                      onZoomChange={handleZoomChange}
                    />
                  )
                ) : (
                  <ImageViewer
                    src={displayImage}
                    alt="Source"
                    className="w-full h-full border-0 rounded-none bg-stone-50/50 dark:bg-stone-950/50"
                    layoutData={state.layoutData}
                    isAnalyzingLayout={state.isAnalyzingLayout}
                    onFullscreen={() => setFullscreenImg(displayImage)}
                    zoom={imageZoom}
                    onZoomChange={handleZoomChange}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
