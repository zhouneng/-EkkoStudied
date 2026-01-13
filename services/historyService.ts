import { get, set, del, getMany } from 'idb-keyval';
import { HistoryItem } from '../types';

const HISTORY_KEY = 'unimage_history_ids';

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
};

export const deleteHistoryItemById = async (id: string) => {
  await del(id);
  const ids = (await get(HISTORY_KEY)) || [];
  await set(HISTORY_KEY, ids.filter((existingId: string) => existingId !== id));
};
