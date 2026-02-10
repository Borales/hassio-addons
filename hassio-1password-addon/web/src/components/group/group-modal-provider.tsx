'use client';

import { GroupWithSecrets } from '@/service/group.service';
import { createContext, ReactNode, useContext, useState } from 'react';

type GroupModalMode = 'create' | 'edit' | null;

type GroupModalContextType = {
  activeGroup: GroupWithSecrets | null;
  mode: GroupModalMode;
  openCreateModal: () => void;
  openEditModal: (group: GroupWithSecrets) => void;
  closeModal: () => void;
};

const GroupModalContext = createContext<GroupModalContextType | undefined>(
  undefined
);

export const GroupModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeGroup, setActiveGroup] = useState<GroupWithSecrets | null>(null);
  const [mode, setMode] = useState<GroupModalMode>(null);

  const openCreateModal = () => {
    setActiveGroup(null);
    setMode('create');
  };

  const openEditModal = (group: GroupWithSecrets) => {
    setActiveGroup(group);
    setMode('edit');
  };

  const closeModal = () => {
    setActiveGroup(null);
    setMode(null);
  };

  return (
    <GroupModalContext.Provider
      value={{ activeGroup, mode, openCreateModal, openEditModal, closeModal }}
    >
      {children}
    </GroupModalContext.Provider>
  );
};

export const useGroupModal = () => {
  const context = useContext(GroupModalContext);
  if (!context) {
    throw new Error('useGroupModal must be used within GroupModalProvider');
  }
  return context;
};
