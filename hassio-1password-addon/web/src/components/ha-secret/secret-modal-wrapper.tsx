'use client';

import { HASecretModal, ModalItem } from './secret-modal';
import { useSecretModal } from './secret-modal-provider';

type SecretModalWrapperProps = {
  opItems: ModalItem[];
};

export const SecretModalWrapper = ({ opItems }: SecretModalWrapperProps) => {
  const { activeSecret } = useSecretModal();

  if (!activeSecret) {
    return null;
  }

  return (
    <HASecretModal
      key={activeSecret.id}
      activeSecret={activeSecret}
      opItems={opItems}
    />
  );
};
