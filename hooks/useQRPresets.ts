import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRPreset } from '@/constants/QRTypes';

const STORAGE_KEY = '@qrpoint_presets';

function makeId() {
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useQRPresets() {
  const [presets, setPresets] = useState<QRPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setPresets(raw ? JSON.parse(raw) : []);
    } catch {
      setPresets([]);
    } finally {
      setLoading(false);
    }
  }

  const persist = useCallback(async (next: QRPreset[]) => {
    setPresets(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addPreset = useCallback(async (preset: Omit<QRPreset, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => {
    const nextPreset: QRPreset = {
      id: preset.id ?? makeId(),
      name: preset.name,
      createdAt: preset.createdAt ?? Date.now(),
      config: preset.config,
      previewImagePath: preset.previewImagePath,
    };

    setPresets(prev => {
      const next = [nextPreset, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    return nextPreset;
  }, []);

  const updatePreset = useCallback(async (id: string, patch: Partial<Pick<QRPreset, 'name' | 'config'>>) => {
    setPresets(prev => {
      const next = prev.map(preset => (preset.id === id ? { ...preset, ...patch } : preset));
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deletePreset = useCallback(async (id: string) => {
    setPresets(prev => {
      const next = prev.filter(preset => preset.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearPresets = useCallback(async () => {
    setPresets([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { presets, loading, addPreset, updatePreset, deletePreset, clearPresets, refresh: load };
}
