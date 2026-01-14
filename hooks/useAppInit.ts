/**
 * 文件名: useAppInit.ts
 * 功能: 应用初始化逻辑 Hook。
 * 核心逻辑:
 * 1. 加载用户偏好设置（主题、API模式）。
 * 2. 检查 API Key 状态。
 * 3. 从 IndexedDB 恢复历史记录和缓存的任务状态。
 */

import { useState, useEffect } from 'react';
import { getHistory } from '../services/historyService';
import { loadCurrentTask } from '../services/cacheService';
import { AppState } from '../types';

export const useAppInit = (INITIAL_STATE: AppState) => {
  const [showLanding, setShowLanding] = useState(true);
  const [hasKey, setHasKey] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [apiMode, setApiMode] = useState<'official' | 'custom'>('custom');
  const [activeModelName, setActiveModelName] = useState('Gemini 2.0 Flash');
  const [initialAppState, setInitialAppState] = useState<Partial<AppState>>({});
  const [initialDisplayImage, setInitialDisplayImage] = useState<string | null>(null);

  // 主题处理
  useEffect(() => {
    const savedTheme = localStorage.getItem('berryxia_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('berryxia_theme', theme);
  }, [theme]);

  // 初始化逻辑
  useEffect(() => {
    const init = async () => {
      // 加载 API 模式
      const storedMode = (localStorage.getItem('berryxia_api_mode') || 'custom') as 'official' | 'custom';
      setApiMode(storedMode);

      // 加载特定模型名称
      const storedFastModel = localStorage.getItem('berryxia_model_fast');
      if (storedFastModel) setActiveModelName(storedFastModel);

      // 检查环境变量 Key
      const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (envKey && envKey.length > 10) {
        setHasKey(true);
      }

      // 检查 LocalStorage Key
      const storedKey = storedMode === 'official'
        ? (localStorage.getItem('berryxia_api_key_official') || localStorage.getItem('berryxia_api_key'))
        : (localStorage.getItem('berryxia_api_key_custom') || localStorage.getItem('berryxia_api_key'));

      if (storedKey) setHasKey(true);

      try {
        const [hist, cached] = await Promise.all([
          getHistory(),
          loadCurrentTask()
        ]);

        let generatedImages: string[] = [];
        let mergedState: Partial<AppState> = { history: hist };

        if (cached) {
          // 如果需要，从历史记录重建生成的图像
          const imagesFromHistory = hist
            .filter(item => item.generatedImage)
            .map(item => item.generatedImage as string);

          generatedImages = imagesFromHistory.length > 0 ? imagesFromHistory : cached.generatedImages;

          mergedState = {
            ...mergedState,
            image: cached.image,
            mimeType: cached.mimeType,
            isFusionMode: cached.isFusionMode || false,
            productImage: cached.productImage || null,
            productMimeType: cached.productMimeType || '',
            isVideoMode: cached.isVideoMode || false,
            detectedAspectRatio: cached.detectedAspectRatio,
            videoAnalysisDuration: cached.videoAnalysisDuration,
            results: cached.results,
            editablePrompt: cached.editablePrompt,
            generatedImage: cached.generatedImage || (hist.length > 0 ? hist[0].generatedImage : null),
            generatedImages: generatedImages,
            layoutData: cached.layoutData,
            promptCache: cached.promptCache,
            selectedHistoryIndex: cached.selectedHistoryIndex || 0,
            referenceImages: cached.referenceImages || []
          };

          // 恢复显示图像
          if (cached.displayImage) {
            setInitialDisplayImage(cached.displayImage);
          }
        } else {
          // 如果没有缓存但存在历史记录，则回退
          if (hist.length > 0) {
            mergedState.generatedImage = hist[0].generatedImage;
            const imagesFromHistory = hist
              .filter(item => item.generatedImage)
              .map(item => item.generatedImage as string);
            mergedState.generatedImages = imagesFromHistory;
          }
        }

        if (cached || hist.length > 0) {
          setShowLanding(false);
        }

        setInitialAppState(mergedState);

      } catch (e) {
        console.error("Initialization failed", e);
      }
    };
    init();
  }, []);

  return {
    showLanding,
    setShowLanding,
    hasKey,
    setHasKey,
    theme,
    setTheme,
    apiMode,
    activeModelName,
    initialAppState,
    initialDisplayImage
  };
};