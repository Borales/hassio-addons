'use client';

import { OpItem } from '@/service/1password.service';
import { HASecretModal } from './secret-modal';
import { useSecretModal } from './secret-modal-provider';

type SecretModalWrapperProps = {
  opItems: OpItem[];
};

export const SecretModalWrapper = ({ opItems }: SecretModalWrapperProps) => {
  const { activeSecret } = useSecretModal();

  if (!activeSecret) {
    return null;
  }

  return <HASecretModal activeSecret={activeSecret} opItems={opItems} />;
};
