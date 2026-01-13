import React, { useRef, useState } from 'react';
import { Upload, Plus, AlertCircle } from 'lucide-react';

interface VisualAssetsProps {
  onImageUpload: (file: File) => void;
  uploadedImage: string | null;
}

const VisualAssets: React.FC<VisualAssetsProps> = ({ onImageUpload, uploadedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Unsupported file type. Please upload JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) { // 20MB
      setError("File too large. Max size is 20MB.");
      return;
    }
    onImageUpload(file);
  };

  return (
    <div className="h-full flex flex-col bg-[#0F0F0F] border-r border-[#222]">
      {/* Header */}
      <div className="h-12 border-b border-[#222] flex items-center justify-between px-4 text-xs font-semibold tracking-wider text-gray-300">
        <span>VISUAL ASSETS</span>
        <button className="hover:text-white"><Plus size={14} /></button>
      </div>

      {/* Drop Zone */}
      <div className="flex-1 p-4 flex flex-col relative">
        <div 
          className={`flex-1 rounded-lg border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
            isDragging 
              ? 'border-orange-500 bg-orange-500/10' 
              : 'border-[#333] hover:border-[#444] bg-[#0c0c0c]'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !uploadedImage && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp"
          />

          {uploadedImage ? (
            <div className="relative w-full h-full p-2 group cursor-default">
                <img 
                  src={`data:image/jpeg;base64,${uploadedImage}`} 
                  alt="Uploaded Asset" 
                  className="w-full h-full object-contain rounded-md" 
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute bottom-4 right-4 bg-black/80 hover:bg-black text-white p-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Change Image
                </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-gray-500">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <h3 className="text-gray-300 font-medium text-sm mb-1">拖入、点击或粘贴参考图片</h3>
                <p className="text-gray-600 text-xs">支持高保真图像或 Sora 级短视频解析</p>
                <p className="text-gray-600 text-[10px] mt-2">MAX 20MB · Ctrl+V / Cmd+V 粘贴</p>
              </div>
            </>
          )}
        </div>
        
        {error && (
            <div className="absolute bottom-6 left-6 right-6 bg-red-900/80 text-red-100 text-xs p-2 rounded flex items-center gap-2">
                <AlertCircle size={14} />
                {error}
            </div>
        )}
      </div>
    </div>
  );
};

export default VisualAssets;