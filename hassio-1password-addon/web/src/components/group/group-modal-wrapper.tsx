'use client';

import { Secret as HaSecretItem } from '@prisma-generated/client';
import { GroupModal } from './group-modal';
import { useGroupModal } from './group-modal-provider';

type GroupModalWrapperProps = {
  secrets: HaSecretItem[];
};

export const GroupModalWrapper = ({ secrets }: GroupModalWrapperProps) => {
  const { activeGroup, mode } = useGroupModal();

  if (!mode) {
    return null;
  }

  return (
    <GroupModal
      group={activeGroup}
      secrets={secrets}
      isNew={mode === 'create'}
    />
  );
};
