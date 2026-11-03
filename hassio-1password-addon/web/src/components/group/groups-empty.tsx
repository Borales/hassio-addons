'use client';

import { eventForGroup } from '@/lib/secret-status';
import { SquaresFourIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '../ui/empty-state';
import { EventName } from '../ui/event-name';
import { CreateGroupButton } from './create-group-button';

export const GroupsEmpty = () => {
  const t = useTranslations('groups');

  return (
    <EmptyState
      icon={SquaresFourIcon}
      title={t('noGroupsYet')}
      action={<CreateGroupButton />}
    >
      {t.rich('emptyBody', {
        event: () => <EventName name={eventForGroup('my_service')} />
      })}
    </EmptyState>
  );
};
