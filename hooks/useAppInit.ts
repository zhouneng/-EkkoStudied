
import { useState, useEffect } from 'react';
import { getHistory } from '../services/historyService';
import { loadCurrentTask } from '../services/cacheService';
import { AppState } from '../types';

export const useAppInit = (INITIAL_STATE: AppState) => {
  const [showLanding, setShowLanding] = useState(true);
  const [hasKey, setHasKey] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [apiMode, setApiMode] = useState<'official' | 'custom'>('custom');
  const [activeModelName, setActiveModelName] = useState('Gemini 2.0 Flash');
  const [initialAppState, setInitialAppState] = useState<Partial<AppState>>({});
  const [initialDisplayImage, setInitialDisplayImage] = useState<string | null>(null);

  // Theme Handling
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

  // Initialization Logic
  useEffect(() => {
    const init = async () => {
      // Load API Mode
      const storedMode = (localStorage.getItem('berryxia_api_mode') || 'custom') as 'official' | 'custom';
      setApiMode(storedMode);

      // Load specific model name
      const storedFastModel = localStorage.getItem('berryxia_model_fast');
      if (storedFastModel) setActiveModelName(storedFastModel);

      // Check for Environment Key
      const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (envKey && envKey.length > 10) {
        setHasKey(true);
      }

      // Check LocalStorage Key
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
          // Rebuild generated images from history if needed
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

          // Restore display image
          if (cached.displayImage) {
            setInitialDisplayImage(cached.displayImage);
          }
        } else {
          // Fallback if no cache but history exists
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
