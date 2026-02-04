'use client';

import { useSecretStatistics } from '@/hooks/use-secret-statistics';
import type { HaSecret } from '@/service/secret.service';
import {
  Chip,
  Code,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Key, memo, useCallback, useMemo } from 'react';
import { CustomTimeAgo } from '../date-formatter';
import { ActionButtons } from '../ui/action-buttons';
import { ChipList } from '../ui/chip-list';
import { StatisticsBar } from '../ui/statistics-bar';
import { StatusIndicator } from '../ui/status-indicator';
import { HASecretHideToggle } from './secret-hide-toggle';
import { HASecretItemEdit } from './secret-item-edit';

type Item = Pick<
  HaSecret,
  'id' | 'isSkipped' | 'itemId' | 'updatedAt' | 'reference'
> & {
  groups?: Array<{ id: string; name: string }>;
};

type HASecretListProps = {
  items: Item[];
};

export const HASecretList = ({ items }: HASecretListProps) => {
  const t = useTranslations('secrets.list');
  const stats = useSecretStatistics(items);

  const COLUMNS = useMemo(
    () => [
      { key: 'secretKey', label: t('columns.secretKey') },
      { key: 'reference', label: t('columns.reference') },
      { key: 'lastUpdated', label: t('columns.lastUpdated') },
      { key: 'actions', label: t('columns.actions') }
    ],
    [t]
  );

  const statisticsConfig = useMemo(
    () => [
      { label: t('statistics.total'), value: stats.total, showWhenZero: true },
      {
        label: t('statistics.assigned'),
        value: stats.assigned,
        color: 'success' as const,
        showWhenZero: true
      },
      {
        label: t('statistics.unassigned'),
        value: stats.unassigned,
        color: 'warning' as const,
        showWhenZero: true
      },
      {
        label: t('statistics.hidden'),
        value: stats.skipped,
        color: 'muted' as const,
        showWhenZero: false
      }
    ],
    [stats, t]
  );

  return (
    <>
      <StatisticsBar stats={statisticsConfig} />

      <Table aria-label={t('ariaLabel')} removeWrapper>
        <TableHeader columns={COLUMNS}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === 'actions' ? 'end' : 'start'}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

function renderCell(item: Item, columnKey: Key) {
  switch (columnKey) {
    case 'secretKey':
      return <SecretKeyCell item={item} />;
    case 'reference':
      return <ReferenceCell reference={item.reference} />;
    case 'lastUpdated':
      return <LastUpdatedCell date={item.updatedAt} />;
    case 'actions':
      return <ActionsCell item={item} />;
    default:
      return null;
  }
}

const SecretKeyCell = memo(({ item }: { item: Item }) => {
  const t = useTranslations('secrets.list.status');
  const isSkipped = item.isSkipped;
  const isAssigned = !!item.itemId && !item.isSkipped;

  const statusConfig = isSkipped
    ? { status: 'inactive' as const, label: t('hidden') }
    : isAssigned
      ? { status: 'success' as const, label: t('assigned') }
      : { status: 'warning' as const, label: t('unassigned') };

  const groupChips =
    item.groups?.map((group) => ({
      id: group.id,
      label: group.name
    })) || [];

  const renderChip = useCallback(
    (group: { id: string; label: string }) => (
      <Chip
        key={group.id}
        size="sm"
        variant="flat"
        classNames={{
          base: 'h-5 bg-default-100 dark:bg-default-200',
          content: 'text-[10px] font-medium text-default-600 px-1'
        }}
      >
        {group.label}
      </Chip>
    ),
    []
  );

  return (
    <div className="flex min-w-0 items-center gap-3">
      <StatusIndicator {...statusConfig} />
      <span className="truncate font-mono text-sm font-medium">{item.id}</span>
      {groupChips.length > 0 && (
        <ChipList
          items={groupChips}
          maxVisible={2}
          chipClassName="h-5 bg-default-100 dark:bg-default-200"
          renderChip={renderChip}
        />
      )}
    </div>
  );
});

SecretKeyCell.displayName = 'SecretKeyCell';

const ReferenceCell = memo(({ reference }: { reference?: string | null }) => {
  const t = useTranslations('secrets.list.status');
  return reference ? (
    <span className="font-mono text-xs">
      <Code>{reference}</Code>
    </span>
  ) : (
    <span className="text-default-300 dark:text-default-500 text-xs">
      {t('notLinked')}
    </span>
  );
});

ReferenceCell.displayName = 'ReferenceCell';

const LastUpdatedCell = memo(({ date }: { date?: Date | null }) => {
  return (
    <div className="text-default-500 text-sm">
      {date ? (
        <CustomTimeAgo date={date} />
      ) : (
        <span className="text-default-300 dark:text-default-500">—</span>
      )}
    </div>
  );
});

LastUpdatedCell.displayName = 'LastUpdatedCell';

const ActionsCell = memo(({ item }: { item: Item }) => {
  return (
    <ActionButtons>
      {!item.isSkipped && <HASecretItemEdit secretId={item.id} />}
      <HASecretHideToggle secretId={item.id} isSkipped={item.isSkipped} />
    </ActionButtons>
  );
});

ActionsCell.displayName = 'ActionsCell';
