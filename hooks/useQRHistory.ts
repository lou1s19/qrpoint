import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRHistoryItem } from '@/constants/QRTypes';
import * as FileSystem from 'expo-file-system';

const STORAGE_KEY = '@qrpoint_history';
const historyListeners = new Set<(items: QRHistoryItem[]) => void>();

function broadcastHistory(items: QRHistoryItem[]) {
  historyListeners.forEach(listener => listener(items));
}

export function useQRHistory() {
  const [items, setItems] = useState<QRHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const listener = (nextItems: QRHistoryItem[]) => {
      setItems(nextItems);
    };

    historyListeners.add(listener);
    load();

    return () => {
      historyListeners.delete(listener);
    };
  }, []);

  async function load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function persist(next: QRHistoryItem[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } finally {
      broadcastHistory(next);
    }
  }

  const addItem = useCallback(async (item: QRHistoryItem) => {
    setItems(prev => {
      const next = [item, ...prev];
      void persist(next);
      return next;
    });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setItems(prev => {
      const itemToDelete = prev.find(i => i.id === id);
      if (itemToDelete?.localImagePath) {
        FileSystem.deleteAsync(itemToDelete.localImagePath, { idempotent: true }).catch(() => {});
      }
      const next = prev.filter(i => i.id !== id);
      void persist(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(async () => {
    setItems(prev => {
      prev.forEach(item => {
        if (item.localImagePath) {
          FileSystem.deleteAsync(item.localImagePath, { idempotent: true }).catch(() => {});
        }
      });
      return [];
    });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } finally {
      broadcastHistory([]);
    }
  }, []);

  const refresh = useCallback(() => load(), []);

  return { items, loading, addItem, deleteItem, clearAll, refresh };
}
