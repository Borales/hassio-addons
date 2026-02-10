'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { Item } from './secret-modal';

type SecretModalContextType = {
  activeSecret: Item | null;
  openModal: (secret: Item) => void;
  closeModal: () => void;
};

const SecretModalContext = createContext<SecretModalContextType | undefined>(
  undefined
);

export const SecretModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeSecret, setActiveSecret] = useState<Item | null>(null);

  const openModal = (secret: Item) => {
    setActiveSecret(secret);
  };

  const closeModal = () => {
    setActiveSecret(null);
  };

  return (
    <SecretModalContext.Provider
      value={{ activeSecret, openModal, closeModal }}
    >
      {children}
    </SecretModalContext.Provider>
  );
};

export const useSecretModal = () => {
  const context = useContext(SecretModalContext);
  if (!context) {
    throw new Error('useSecretModal must be used within SecretModalProvider');
  }
  return context;
};
