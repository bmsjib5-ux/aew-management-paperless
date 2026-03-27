import { createContext, useContext } from 'react';
import { DEFAULT_SETTINGS } from '../data/settingsData';
import { useLocalStorage } from '../utils/useLocalStorage';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('paperless_settings', DEFAULT_SETTINGS);

  const updateList = (key, newList) => {
    setSettings(prev => ({ ...prev, [key]: newList }));
  };

  const addItem = (key, item) => {
    const trimmed = item.trim();
    if (!trimmed) return false;
    if (settings[key].includes(trimmed)) return false;
    setSettings(prev => ({ ...prev, [key]: [...prev[key], trimmed] }));
    return true;
  };

  const removeItem = (key, item) => {
    setSettings(prev => ({ ...prev, [key]: prev[key].filter(i => i !== item) }));
  };

  const editItem = (key, oldItem, newItem) => {
    const trimmed = newItem.trim();
    if (!trimmed || trimmed === oldItem) return false;
    setSettings(prev => ({
      ...prev,
      [key]: prev[key].map(i => i === oldItem ? trimmed : i),
    }));
    return true;
  };

  // ── computed helpers ──────────────────────────────────────────────────────
  // รายชื่อโรงพยาบาลทั้งหมด (source: hospitalHmainMap, fallback: hospitals)
  const hospitalList = (settings.hospitalHmainMap && settings.hospitalHmainMap.length > 0)
    ? settings.hospitalHmainMap
    : (settings.hospitals || []).map(h => ({ name: h, hmain: '' }));

  const hospitalNames = hospitalList.map(h => h.name);

  const getHmain = (name) => {
    const found = hospitalList.find(h => h.name === name);
    return found ? found.hmain : '';
  };

  return (
    <SettingsContext.Provider value={{ settings, updateList, addItem, removeItem, editItem, hospitalList, hospitalNames, getHmain }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
