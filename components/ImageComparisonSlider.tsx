/**
 * 文件名: ImageComparisonSlider.tsx
 * 功能: 图片对比滑块组件。
 * 核心逻辑:
 * 1. 提供左右滑动条来对比两张图片 (Before/After)。
 * 2. 支持并排模式 (Side-by-Side) 和滑块模式，根据容器宽度自动切换。
 * 3. 支持布局分析覆盖层 (LayoutOverlay) 的显示。
 * 4. 支持同步缩放和平移。
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { LayoutOverlay } from './LayoutOverlay';
import { LayoutElement } from '../types';
import { ImageZoomState, calculateNewZoom } from '../utils/zoom';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  layoutData?: LayoutElement[] | null;
  onToggleLayout?: () => void;
  isAnalyzingLayout?: boolean;
  onFullscreen?: () => void;
  zoom?: ImageZoomState;
  onZoomChange?: (newZoom: ImageZoomState) => void;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Original',
  afterLabel = 'Generated',
  className = '',
  layoutData,
  onToggleLayout,
  isAnalyzingLayout,
  onFullscreen,
  zoom = { scale: 1, panX: 0, panY: 0 },
  onZoomChange,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 切换并排模式的阈值
  const SIDE_BY_SIDE_THRESHOLD = 600;
  const useSideBySide = containerWidth >= SIDE_BY_SIDE_THRESHOLD;

  // 监听容器宽度变化
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  // 注册全局拖拽事件监听
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!onZoomChange || !containerRef.current) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const eventOffsetX = e.clientX - rect.left;
    const eventOffsetY = e.clientY - rect.top;

    // 确定缩放中心
    let centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 并排模式下的中心点调整
    if (useSideBySide) {
      if (eventOffsetX < rect.width / 2) {
        // 左侧图片中心
        centerX = rect.width / 4;
      } else {
        // 右侧图片中心
        centerX = (rect.width * 3) / 4;
      }
    }

    // 相对于所选中心的鼠标位置
    const mouseX = eventOffsetX - centerX;
    const mouseY = eventOffsetY - centerY;

    const newZoom = calculateNewZoom(zoom, mouseX, mouseY, e.deltaY);
    onZoomChange(newZoom);
  };

  const transformStyle = zoom.scale > 1
    ? {
      transform: `translate(${zoom.panX}px, ${zoom.panY}px) scale(${zoom.scale})`,
      transformOrigin: 'center center'
    }
    : {};

  // 并排模式 (Side-by-Side)
  if (useSideBySide) {
    return (
      <div
        ref={containerRef}
        className={`relative rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 overflow-hidden select-none group h-full w-full ${className}`}
        onWheel={handleWheel}
      >
        <div className="absolute inset-0 flex">
          {/* Before Image */}
          <div className="flex-1 relative border-r border-stone-200 dark:border-stone-700 overflow-hidden">
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="w-full h-full object-contain transition-transform duration-100"
              style={transformStyle}
              draggable={false}
            />
            <div className="absolute top-3 left-3 px-2 py-1 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded text-stone-800 dark:text-white/90 select-none flex items-center shadow-sm">
              <span className="text-[10px] font-medium uppercase tracking-wider leading-none pt-[1px]">{beforeLabel}</span>
            </div>
          </div>

          {/* After Image */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src={afterImage}
              alt={afterLabel}
              className="w-full h-full object-contain transition-transform duration-100"
              style={transformStyle}
              draggable={false}
            />
            <div className="absolute top-3 right-3 px-2 py-1 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded text-stone-800 dark:text-white/90 select-none flex items-center shadow-sm">
              <span className="text-[10px] font-medium uppercase tracking-wider leading-none pt-[1px]">{afterLabel}</span>
            </div>
          </div>
        </div>

        {/* 缩放指示器 */}
        {zoom.scale > 1 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] font-bold text-white z-30">
            {Math.round(zoom.scale * 100)}%
          </div>
        )}

        {layoutData && <LayoutOverlay data={layoutData} show={true} />}

        {/* 全屏按钮 */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20" style={{ right: '50%', transform: 'translateX(50%)' }}>
          {onFullscreen && (
            <button
              onClick={(e) => { e.stopPropagation(); onFullscreen(); }}
              className="p-2.5 bg-white/90 backdrop-blur rounded-xl shadow-xl hover:bg-white text-stone-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
              title="查看大图"
            >
              <Icons.Maximize size={16} />
            </button>
          )}
        </div>

        {onToggleLayout && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLayout(); }}
              disabled={isAnalyzingLayout}
              className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-[10px] font-bold text-stone-600 border border-stone-200 hover:bg-white transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              {isAnalyzingLayout ? <Icons.RefreshCw size={12} className="animate-spin" /> : <Icons.Compass size={12} />}
              BLUEPRINT
            </button>
          </div>
        )}
      </div>
    );
  }

  // 滑块模式 (Slider mode)
  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 overflow-hidden select-none group h-full w-full ${className}`}
      onWheel={handleWheel}
    >

      <img
        src={afterImage}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-contain transition-transform duration-100"
        style={transformStyle}
        draggable={false}
      />

      <img
        src={beforeImage}
        alt={beforeLabel}
        className="absolute inset-0 w-full h-full object-contain transition-transform duration-100"
        style={{
          ...transformStyle,
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
        draggable={false}
      />

      {layoutData && <LayoutOverlay data={layoutData} show={true} />}

      <div className="absolute top-3 left-3 px-2 py-1 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded text-stone-800 dark:text-white/90 select-none flex items-center shadow-sm">
        <span className="text-[10px] font-medium uppercase tracking-wider leading-none pt-[1px]">{beforeLabel}</span>
      </div>

      <div className="absolute top-3 right-3 px-2 py-1 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded text-stone-800 dark:text-white/90 select-none flex items-center shadow-sm">
        <span className="text-[10px] font-medium uppercase tracking-wider leading-none pt-[1px]">{afterLabel}</span>
      </div>

      {/* 缩放指示器 */}
      {
        zoom.scale > 1 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] font-bold text-white z-30">
            {Math.round(zoom.scale * 100)}%
          </div>
        )
      }

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20" style={{ right: '3rem' }}>
        {onFullscreen && (
          <button
            onClick={(e) => { e.stopPropagation(); onFullscreen(); }}
            className="p-2.5 bg-white/90 backdrop-blur rounded-xl shadow-xl hover:bg-white text-stone-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
            title="查看大图"
          >
            <Icons.Maximize size={16} />
          </button>
        )}
      </div>

      {
        onToggleLayout && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLayout(); }}
              disabled={isAnalyzingLayout}
              className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-[10px] font-bold text-stone-600 border border-stone-200 hover:bg-white transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              {isAnalyzingLayout ? <Icons.RefreshCw size={12} className="animate-spin" /> : <Icons.Compass size={12} />}
              BLUEPRINT
            </button>
          </div>
        )
      }

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icons.ArrowLeftRight size={16} className="text-stone-600" />
        </div>
      </div>
    </div >
  );
};