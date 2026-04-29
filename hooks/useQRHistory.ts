import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRHistoryItem } from '@/constants/QRTypes';

const STORAGE_KEY = '@qrpoint_history';

export function useQRHistory() {
  const [items, setItems] = useState<QRHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }

  async function save(next: QRHistoryItem[]) {
    setItems(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const addItem = useCallback(async (item: QRHistoryItem) => {
    setItems(prev => {
      const next = [item, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const refresh = useCallback(() => load(), []);

  return { items, loading, addItem, deleteItem, refresh };
}
