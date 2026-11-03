'use client';

import type { SecretRow } from '@/lib/secret-status';
import { createContext, ReactNode, useContext, useState } from 'react';

type SecretModalContextType = {
  activeSecret: SecretRow | null;
  openModal: (secret: SecretRow) => void;
  closeModal: () => void;
};

const SecretModalContext = createContext<SecretModalContextType | undefined>(
  undefined
);

export const SecretModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeSecret, setActiveSecret] = useState<SecretRow | null>(null);

  const openModal = (secret: SecretRow) => {
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
