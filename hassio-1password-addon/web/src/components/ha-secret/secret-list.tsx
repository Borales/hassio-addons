'use client';

import {
  countByStatus,
  matchesSearch,
  SecretRow,
  SecretStatus
} from '@/lib/secret-status';
import {
  FileIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  WarningIcon,
  XIcon
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { CustomTimeAgo } from '../date-formatter';
import { ItemRef } from '../op-secret/item-ref';
import { OpSecretIcon } from '../op-secret/secret-icon';
import { ChipList } from '../ui/chip-list';
import { CopyButton } from '../ui/copy-button';
import { EmptyState } from '../ui/empty-state';
import { PageHeader } from '../ui/page';
import { StatusDot } from '../ui/status-dot';
import { BrokenBanner } from './broken-banner';
import { HASecretHideToggle } from './secret-hide-toggle';
import { useSecretModal } from './secret-modal-provider';
import { HASecretUnassign } from './secret-unassign';

type Filter = SecretStatus | 'all';

const FILTERS: Filter[] = ['all', 'broken', 'unassigned', 'assigned', 'hidden'];

type HASecretListProps = {
  items: SecretRow[];
  /** Shown above the broken-references banner. */
  serviceAccountBanner?: ReactNode;
  /** Shown below the broken-references banner. */
  rateLimitBanner?: ReactNode;
};

export const HASecretList = ({
  items,
  serviceAccountBanner,
  rateLimitBanner
}: HASecretListProps) => {
  const t = useTranslations('secrets.list');
  const tHome = useTranslations('home');
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<Filter>('all');
  const searchRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(() => countByStatus(items), [items]);
  // The Broken segment disappears at zero, so its filter falls back to All.
  const filter =
    selectedFilter === 'broken' && counts.broken === 0 ? 'all' : selectedFilter;

  const rows = items.filter(
    (row) =>
      (filter === 'all' || row.status === filter) && matchesSearch(row, query)
  );

  // "/" focuses the search box
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (
        event.key === '/' &&
        tag !== 'INPUT' &&
        tag !== 'TEXTAREA' &&
        !document.querySelector('dialog[open]')
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const clearFilters = () => {
    setQuery('');
    setSelectedFilter('all');
  };

  return (
    <>
      {serviceAccountBanner}
      {counts.broken > 0 && (
        <BrokenBanner
          count={counts.broken}
          onShow={
            filter === 'broken'
              ? undefined
              : () => {
                  setQuery('');
                  setSelectedFilter('broken');
                }
          }
        />
      )}
      {rateLimitBanner}

      <PageHeader
        title={tHome('title')}
        description={
          <>
            {tHome('description')}{' '}
            <code className="chip-tag ml-0.5 align-middle !text-[11.5px]">
              secrets.yaml
            </code>
          </>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={FileIcon} title={t('empty.title')}>
          {t.rich('empty.body', {
            code: (chunks) => <span className="font-mono">{chunks}</span>
          })}
        </EmptyState>
      ) : (
        <>
          <div className="mb-4 flex flex-col-reverse gap-3 md:flex-row md:items-center">
            <label className="input input-sm w-full gap-2 md:w-80">
              <MagnifyingGlassIcon size={14} className="opacity-55" />
              <input
                ref={searchRef}
                type="search"
                placeholder={t('searchPlaceholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={t('searchLabel')}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="opacity-60 hover:opacity-100"
                  aria-label={t('clearSearch')}
                >
                  <XIcon size={12} />
                </button>
              ) : (
                <kbd className="kbd kbd-xs hidden md:inline-flex">/</kbd>
              )}
            </label>

            <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:ml-auto md:px-0">
              <div className="seg" role="group" aria-label={t('filterLabel')}>
                {FILTERS.filter(
                  (key) => key !== 'broken' || counts.broken > 0
                ).map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={filter === key}
                    onClick={() => setSelectedFilter(key)}
                  >
                    {key !== 'all' && <StatusDot status={key} />}
                    {t(`filters.${key}`)}
                    <span
                      className={`count ${
                        key === 'broken'
                          ? 'text-error font-medium !opacity-100'
                          : key === 'unassigned' && counts.unassigned > 0
                            ? 'text-unassigned font-medium !opacity-100'
                            : ''
                      }`}
                    >
                      {counts[key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title={t('noMatch')}
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-sm btn-ghost"
                >
                  {t('clearFilters')}
                </button>
              }
            >
              {query ? t('noMatchQuery', { query }) : t('noMatchFilter')}
            </EmptyState>
          ) : (
            <SecretsTable rows={rows} />
          )}
        </>
      )}
    </>
  );
};

const SecretsTable = ({ rows }: { rows: SecretRow[] }) => {
  const t = useTranslations('secrets.list');

  return (
    <>
      {/* Desktop and tablet */}
      <div className="rounded-box hairline hidden overflow-hidden border sm:block">
        <table className="tbl table" aria-label={t('ariaLabel')}>
          <thead>
            <tr>
              <th className="w-[38%] !pl-5">{t('columns.secretKey')}</th>
              <th>{t('columns.reference')}</th>
              <th className="w-[130px]">{t('columns.lastUpdated')}</th>
              <th className="w-[112px] !pr-4">
                <span className="sr-only">{t('columns.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={row.status === 'hidden' ? 'is-hidden' : ''}
              >
                <td className="!pl-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <StatusDot
                      status={row.status}
                      label={t(`status.${row.status}`)}
                    />
                    <SecretKey row={row} />
                    <GroupChips row={row} max={2} />
                  </div>
                </td>
                <td className="max-w-0">
                  <ReferenceCell row={row} />
                </td>
                <td className="text-muted text-[13px] whitespace-nowrap tabular-nums">
                  {row.updatedAt ? (
                    <CustomTimeAgo date={row.updatedAt} />
                  ) : (
                    <span className="opacity-50">-</span>
                  )}
                </td>
                <td className="!pr-4">
                  <RowActions row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: stacked list */}
      <ul
        className="rounded-box hairline divide-base-content/10 divide-y overflow-hidden border sm:hidden"
        aria-label={t('ariaLabel')}
      >
        {rows.map((row) => (
          <li
            key={row.id}
            className={`px-3.5 py-3 ${row.status === 'hidden' ? 'text-muted' : ''}`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <StatusDot
                status={row.status}
                label={t(`status.${row.status}`)}
              />
              <SecretKey row={row} />
              <span className="ml-auto">
                <GroupChips row={row} max={1} />
              </span>
            </div>
            <div className="mt-2 min-w-0 pl-[18px]">
              <ReferenceCell row={row} wrap />
            </div>
            <div className="mt-1.5 flex items-center justify-between pl-[18px]">
              <span className="text-muted text-[11.5px] tabular-nums">
                {row.updatedAt
                  ? t.rich('updated', {
                      time: () => <CustomTimeAgo date={row.updatedAt!} />
                    })
                  : t('neverSynced')}
              </span>
              <RowActions row={row} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

const SecretKey = ({ row }: { row: SecretRow }) => {
  const { openModal } = useSecretModal();

  if (row.status === 'hidden') {
    return <span className="truncate font-mono text-[13px]">{row.id}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => openModal(row)}
      className="hover:text-primary decoration-primary/40 truncate text-left font-mono text-[13px] underline-offset-4 hover:underline"
    >
      {row.id}
    </button>
  );
};

const GroupChips = ({ row, max }: { row: SecretRow; max: number }) => (
  <ChipList
    items={row.groups.map(({ id, name }) => ({ id, label: name }))}
    maxVisible={max}
  />
);

const ReferenceCell = ({
  row,
  wrap = false
}: {
  row: SecretRow;
  wrap?: boolean;
}) => {
  const t = useTranslations('secrets.list');
  const tBroken = useTranslations('secrets.broken');
  const { openModal } = useSecretModal();
  const { ref } = row;

  if (row.status === 'hidden') {
    return (
      <span className="text-muted text-[12.5px]">{t('hiddenNotSynced')}</span>
    );
  }

  if (!ref) {
    return (
      <button
        type="button"
        onClick={() => openModal(row)}
        className="btn btn-xs btn-soft btn-primary border-primary/35 gap-1.5"
      >
        <LinkIcon size={12} />
        {t('assignAction')}
      </button>
    );
  }

  const fieldAriaLabel = t('fieldAria', { label: ref.fieldLabel });

  if (row.status === 'broken') {
    return (
      <span
        className={`flex max-w-full min-w-0 gap-2 ${wrap ? 'flex-col items-start' : 'items-center'}`}
      >
        <span className="flex min-w-0 items-start gap-2">
          <WarningIcon size={15} className="text-error mt-[3px] shrink-0" />
          <span className="flex min-w-0 flex-col">
            <ItemRef
              reference={ref}
              wrap={wrap}
              stale={
                row.broken === 'vault' ? null : (row.broken as 'item' | 'field')
              }
              fieldAriaLabel={fieldAriaLabel}
            />
            <span className="text-error mt-0.5 text-[12px]">
              {tBroken(row.broken!, ref)}
            </span>
          </span>
        </span>
        <button
          type="button"
          onClick={() => openModal(row)}
          className={`btn btn-xs btn-soft btn-primary border-primary/35 shrink-0 gap-1.5 ${wrap ? 'ml-[23px]' : 'ml-auto'}`}
        >
          <LinkIcon size={12} />
          {tBroken('relink')}
        </button>
      </span>
    );
  }

  return (
    <span
      className={`flex max-w-full min-w-0 gap-2 ${wrap ? 'items-start' : 'items-center'}`}
    >
      <OpSecretIcon urls={row.urls} size={18} />
      <ItemRef reference={ref} wrap={wrap} fieldAriaLabel={fieldAriaLabel} />
      <span className="reveal -my-1 shrink-0">
        <CopyButton text={row.reference!} label={t('actions.copyReference')} />
      </span>
    </span>
  );
};

const RowActions = ({ row }: { row: SecretRow }) => {
  const t = useTranslations('secrets.list.actions');
  const { openModal } = useSecretModal();
  const hidden = row.status === 'hidden';

  return (
    <div className="row-actions flex items-center justify-end gap-0.5">
      {row.reference && !hidden && (
        <>
          {row.status !== 'broken' && (
            <span className="tooltip" data-tip={t('change')}>
              <button
                type="button"
                onClick={() => openModal(row)}
                className="btn btn-ghost btn-xs btn-square max-sm:size-11"
                aria-label={t('changeAria', { name: row.id })}
              >
                <PencilSimpleIcon size={14} />
              </button>
            </span>
          )}
          <HASecretUnassign
            secretId={row.id}
            itemId={row.itemId}
            reference={row.reference}
          />
        </>
      )}
      <HASecretHideToggle secretId={row.id} isSkipped={row.isSkipped} />
    </div>
  );
};
