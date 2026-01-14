/**
 * 文件名: cacheService.ts
 * 功能: 当前任务状态缓存服务，防止刷新丢失数据。
 * 核心逻辑:
 * 1. 保存当前应用状态 (AppState) 到 IndexedDB。
 * 2. 排除大型历史记录数组以优化存储。
 * 3. 提供加载和清除缓存的方法。
 */

import { get, set, del } from 'idb-keyval';
import { AppState } from '../types';

const CACHE_KEY = 'unimage_current_task';

export const saveCurrentTask = async (state: Partial<AppState>) => {
  // 排除大型历史记录数组以避免重复存储，仅保留当前任务数据
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { history, ...rest } = state as any;
  await set(CACHE_KEY, rest);
};

export const loadCurrentTask = async (): Promise<Partial<AppState> | null> => {
  return await get(CACHE_KEY);
};

export const clearCurrentTask = async () => {
  await del(CACHE_KEY);
};