import { get, set, del } from 'idb-keyval';
import { AppState } from '../types';

const CACHE_KEY = 'unimage_current_task';

export const saveCurrentTask = async (state: Partial<AppState>) => {
  // Filter out large history array to avoid duplicating storage, keep only current task data
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
