/**
 * 文件名: usePanelResizer.ts
 * 功能: 面板尺寸调整逻辑 Hook。
 * 核心逻辑:
 * 1. 管理左侧面板的百分比宽度和右侧面板的像素宽度。
 * 2. 监听鼠标拖拽事件，实时计算新的面板尺寸。
 * 3. 将用户偏好的布局尺寸持久化到 LocalStorage。
 */

import { useState, useEffect, useRef } from 'react';

export const usePanelResizer = () => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => parseFloat(localStorage.getItem('unimage_left_panel_width') || '50'));
  const [rightPanelWidth, setRightPanelWidth] = useState(() => parseInt(localStorage.getItem('unimage_right_panel_width') || '320'));
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [isDraggingRightDivider, setIsDraggingRightDivider] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // 持久化左侧面板宽度
  useEffect(() => {
    localStorage.setItem('unimage_left_panel_width', leftPanelWidth.toString());
  }, [leftPanelWidth]);

  // 右侧面板宽度的持久化逻辑在拖拽处理程序中处理，
  // 但如果需要，可以在此处确保一致性。

  // 分隔线拖拽处理程序
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

  return {
    leftPanelWidth,
    rightPanelWidth,
    isDraggingDivider,
    isDraggingRightDivider,
    setIsDraggingDivider,
    setIsDraggingRightDivider,
    mainRef
  };
};