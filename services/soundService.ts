/**
 * 文件名: soundService.ts
 * 功能: 全局音效服务管理。
 * 核心逻辑:
 * 1. 使用 Web Audio API 生成简单的提示音。
 * 2. 管理音效开关状态并持久化到 LocalStorage。
 * 3. 提供开始、完成、错误等不同场景的音效方法。
 */

class SoundService {
  private enabled: boolean = true;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unimage_sound_enabled');
      this.enabled = saved !== null ? JSON.parse(saved) : true;
    }
  }

  isEnabled() { return this.enabled; }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('unimage_sound_enabled', JSON.stringify(enabled));
  }

  private getContext() {
    if (!this.enabled) return null;
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
    return this.audioContext;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }

  playStart() { this.playTone(600, 'sine', 0.1); this.playTone(800, 'sine', 0.2, 0.1); }
  playStepComplete() { this.playTone(800, 'sine', 0.1); }
  playComplete() { this.playTone(600, 'sine', 0.1); this.playTone(1200, 'sine', 0.4, 0.1); }
  playError() { this.playTone(200, 'sawtooth', 0.3); }
}

export const soundService = new SoundService();