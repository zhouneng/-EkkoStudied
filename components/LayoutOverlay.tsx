/**
 * 文件名: LayoutOverlay.tsx
 * 功能: 布局分析覆盖层组件。
 * 核心逻辑:
 * 1. 接收布局元素数据 (LayoutElement[])。
 * 2. 根据坐标绘制半透明的边界框 (Bounding Boxes) 叠加在图片上。
 * 3. 不同的层级 (Primary/Secondary) 使用不同的颜色高亮。
 */

import React, { useEffect, useState } from 'react';
import { LayoutElement } from '../types';

interface LayoutOverlayProps {
  data: LayoutElement[];
  show: boolean;
}

export const LayoutOverlay: React.FC<LayoutOverlayProps> = ({ data, show }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  if (!show && !isVisible) return null;

  const getStyle = (box: [number, number, number, number]) => {
    const [ymin, xmin, ymax, xmax] = box;
    return {
      top: `${(ymin / 1000) * 100}%`,
      left: `${(xmin / 1000) * 100}%`,
      height: `${((ymax - ymin) / 1000) * 100}%`,
      width: `${((xmax - xmin) / 1000) * 100}%`,
    };
  };

  const getColor = (hierarchy: string) => {
    switch (hierarchy) {
      case 'Primary': return 'border-orange-500 bg-orange-500/10';
      case 'Secondary': return 'border-sky-500 bg-sky-500/10';
      default: return 'border-stone-400 bg-stone-400/10';
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {data.map((item, idx) => {
        const styles = getStyle(item.box_2d);
        const colorClass = getColor(item.hierarchy);

        return (
          <div
            key={idx}
            className={`absolute border ${colorClass} group z-10`}
            style={styles}
          >
            <div className={`
              absolute -top-5 left-0 bg-stone-900 text-white text-[9px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity
            `}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};