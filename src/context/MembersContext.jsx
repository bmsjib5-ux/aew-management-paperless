import { createContext, useContext } from 'react';
import { TEAM_MEMBERS } from '../data/sampleData';
import { useLocalStorage } from '../utils/useLocalStorage';

const MembersContext = createContext(null);

export function MembersProvider({ children }) {
  const [members, setMembers] = useLocalStorage('paperless_members', TEAM_MEMBERS);

  const addMember = (member) => setMembers(prev => [...prev, member]);
  const updateMember = (id, updates) =>
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  const removeMember = (id) => setMembers(prev => prev.filter(m => m.id !== id));

  return (
    <MembersContext.Provider value={{ members, addMember, updateMember, removeMember }}>
      {children}
    </MembersContext.Provider>
  );
}

export function useMembers() {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error('useMembers must be used within MembersProvider');
  return ctx;
}
