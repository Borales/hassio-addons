'use client';

import type { SecretRow } from '@/lib/secret-status';
import { GroupModal } from './group-modal';
import { useGroupModal } from './group-modal-provider';

type GroupModalWrapperProps = {
  secrets: SecretRow[];
  groupNames: string[];
};

export const GroupModalWrapper = ({
  secrets,
  groupNames
}: GroupModalWrapperProps) => {
  const { activeGroup, mode } = useGroupModal();

  if (!mode) {
    return null;
  }

  return (
    <GroupModal
      key={activeGroup?.id ?? 'new'}
      group={activeGroup}
      secrets={secrets}
      groupNames={groupNames}
      isNew={mode === 'create'}
    />
  );
};
