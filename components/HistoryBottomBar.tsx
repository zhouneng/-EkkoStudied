
import React from 'react';
import { Icons } from './Icons';
import { HistoryThumbnail } from './HistoryThumbnail';

interface HistoryBottomBarProps {
  generatedImages: string[];
  selectedHistoryIndex: number;
  onLoadHistoryItem: (index: number) => void;
  onDeleteHistoryItem: (index: number) => void;
}

export const HistoryBottomBar: React.FC<HistoryBottomBarProps> = ({
  generatedImages,
  selectedHistoryIndex,
  onLoadHistoryItem,
  onDeleteHistoryItem
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 z-40 transform transition-transform duration-300 ease-in-out flex items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      {/* History List - Full Width */}
      {generatedImages.length === 0 ? (
        <div className="w-full flex items-center justify-center text-stone-400 dark:text-stone-600 gap-2">
          <Icons.Image size={24} strokeWidth={1.5} />
          <span className="text-xs font-medium">No history records</span>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-1 overflow-x-auto overflow-y-hidden w-full h-full py-2 custom-scrollbar px-6">
          {generatedImages.map((img, index) => (
            <div key={index} className="flex-shrink-0 w-20 h-20 relative">
              <HistoryThumbnail
                imageUrl={`data:image/png;base64,${img}`}
                index={index}
                isActive={index === selectedHistoryIndex}
                onClick={() => onLoadHistoryItem(index)}
                onDelete={() => onDeleteHistoryItem(index)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
