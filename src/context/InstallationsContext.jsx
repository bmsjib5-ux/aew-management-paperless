import { createContext, useContext } from 'react';
import { INSTALLATIONS } from '../data/installationData';
import { useLocalStorage } from '../utils/useLocalStorage';

const InstallationsContext = createContext(null);

export function InstallationsProvider({ children }) {
  const [installations, setInstallations] = useLocalStorage('paperless_installations_v2', INSTALLATIONS);

  const addInstallation = (item) => setInstallations(prev => [...prev, item]);
  const updateInstallation = (id, updates) =>
    setInstallations(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const removeInstallation = (id) =>
    setInstallations(prev => prev.filter(i => i.id !== id));

  return (
    <InstallationsContext.Provider value={{ installations, setInstallations, addInstallation, updateInstallation, removeInstallation }}>
      {children}
    </InstallationsContext.Provider>
  );
}

export function useInstallations() {
  const ctx = useContext(InstallationsContext);
  if (!ctx) throw new Error('useInstallations must be used within InstallationsProvider');
  return ctx;
}
