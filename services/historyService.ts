/**
 * 文件名: historyService.ts
 * 功能: 历史记录管理服务，基于 IndexedDB。
 * 核心逻辑:
 * 1. 使用 idb-keyval 库进行本地数据存储。
 * 2. 提供获取、保存和删除历史记录的方法。
 * 3. 维护历史记录 ID 列表以实现有序存储。
 * 4. [NEW] 广播 'history-updated' 事件，实现组件间的状态同步。
 */

import { get, set, del, getMany } from 'idb-keyval';
import { HistoryItem } from '../types';

const HISTORY_KEY = 'unimage_history_ids';

// 辅助函数：触发全局更新事件
const triggerUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('history-updated'));
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  const ids = (await get(HISTORY_KEY)) || [];
  if (ids.length === 0) return [];
  const items = await getMany(ids);
  return items.filter(Boolean).sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp);
};

export const saveHistoryItem = async (item: HistoryItem) => {
  await set(item.id, item);
  const ids = (await get(HISTORY_KEY)) || [];
  if (!ids.includes(item.id)) {
    await set(HISTORY_KEY, [...ids, item.id]);
  }
  triggerUpdate();
};

export const deleteHistoryItemById = async (id: string) => {
  await del(id);
  const ids = (await get(HISTORY_KEY)) || [];
  await set(HISTORY_KEY, ids.filter((existingId: string) => existingId !== id));
  triggerUpdate();
};

export const clearAllHistory = async () => {
  try {
    const ids = (await get(HISTORY_KEY)) || [];
    // 并行删除所有数据项
    await Promise.all(ids.map((id: string) => del(id)));
    // 删除索引
    await del(HISTORY_KEY);
    triggerUpdate();
    console.log("[HistoryService] All history cleared.");
  } catch (e) {
    console.error("[HistoryService] Failed to clear history:", e);
  }
};