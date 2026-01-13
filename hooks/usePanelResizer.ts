import { useState, useEffect, useRef } from 'react';

export const usePanelResizer = () => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => parseFloat(localStorage.getItem('unimage_left_panel_width') || '50'));
  const [rightPanelWidth, setRightPanelWidth] = useState(() => parseInt(localStorage.getItem('unimage_right_panel_width') || '320'));
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [isDraggingRightDivider, setIsDraggingRightDivider] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Persist left panel width
  useEffect(() => {
    localStorage.setItem('unimage_left_panel_width', leftPanelWidth.toString());
  }, [leftPanelWidth]);

  // Persist right panel width logic is handled in the drag handler, 
  // but we can ensure consistency here if needed.

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