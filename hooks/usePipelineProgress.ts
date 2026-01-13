import { useState, useRef, useCallback } from 'react';
import { PipelineProgress, PipelineStepStatus } from '../types';
import { AGENTS, PIPELINE_ORDER } from '../constants';

export const usePipelineProgress = () => {
  const [progress, setProgress] = useState<PipelineProgress | null>(null);
  const startTimeRef = useRef<number>(0);

  const initPipeline = useCallback(() => {
    startTimeRef.current = Date.now();
    const steps = PIPELINE_ORDER.map(role => ({
      name: AGENTS[role].name,
      role: role,
      status: PipelineStepStatus.PENDING,
      progress: 0,
      description: AGENTS[role].description,
      streamingContent: '',
      finalContent: '',
      startTime: 0
    }));

    setProgress({
      isRunning: true,
      totalProgress: 0,
      steps,
      currentStepIndex: -1,
      startTime: startTimeRef.current
    });
  }, []);

  const startStep = useCallback((index: number) => {
    setProgress(prev => {
      if (!prev) return null;
      const newSteps = [...prev.steps];
      newSteps[index] = {
        ...newSteps[index],
        status: PipelineStepStatus.RUNNING,
        startTime: Date.now(),
        progress: 0
      };
      return { ...prev, currentStepIndex: index, steps: newSteps };
    });
  }, []);

  const updateStepContent = useCallback((index: number, content: string) => {
    setProgress(prev => {
        if (!prev) return null;
        const newSteps = [...prev.steps];
        // Calculate artificial progress for running step based on content length
        const currentProgress = Math.min(95, Math.floor(content.length / 5)); 
        
        newSteps[index] = {
            ...newSteps[index],
            streamingContent: content,
            progress: currentProgress
        };
        
        // Calculate total progress
        const totalSteps = newSteps.length;
        const finishedSteps = newSteps.filter(s => s.status === PipelineStepStatus.COMPLETED).length;
        const totalProgress = Math.floor(((finishedSteps + (currentProgress / 100)) / totalSteps) * 100);

        return { ...prev, steps: newSteps, totalProgress };
    });
  }, []);

  const completeStep = useCallback((index: number, content: string) => {
    setProgress(prev => {
        if (!prev) return null;
        const newSteps = [...prev.steps];
        newSteps[index] = {
            ...newSteps[index],
            status: PipelineStepStatus.COMPLETED,
            finalContent: content,
            progress: 100,
            endTime: Date.now()
        };
        const finishedSteps = newSteps.filter(s => s.status === PipelineStepStatus.COMPLETED).length;
        const totalProgress = Math.floor((finishedSteps / newSteps.length) * 100);
        return { ...prev, steps: newSteps, totalProgress };
    });
  }, []);

  const errorStep = useCallback((index: number, error: string) => {
      setProgress(prev => {
          if (!prev) return null;
          const newSteps = [...prev.steps];
          newSteps[index] = {
              ...newSteps[index],
              status: PipelineStepStatus.ERROR,
              error,
              endTime: Date.now()
          };
          return { ...prev, steps: newSteps, isRunning: false };
      });
  }, []);

  const completePipeline = useCallback(() => {
      setProgress(prev => prev ? { ...prev, isRunning: false, totalProgress: 100 } : null);
  }, []);

  const resetPipeline = useCallback(() => {
      setProgress(null);
  }, []);

  const setProgressDirect = useCallback((p: PipelineProgress) => {
      setProgress(p);
  }, []);

  return {
      progress,
      initPipeline,
      startStep,
      updateStepContent,
      completeStep,
      errorStep,
      completePipeline,
      resetPipeline,
      setProgressDirect
  };
};
