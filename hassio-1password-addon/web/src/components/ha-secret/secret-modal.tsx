'use client';

import { fetchOpItemFields } from '@/actions/refresh-op-secret';
import type { SecretRow } from '@/lib/secret-status';
import type { OpItem } from '@/service/1password.service';
import {
  LockSimpleIcon,
  MagnifyingGlassIcon,
  WarningIcon
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';
import { ItemRef } from '../op-secret/item-ref';
import { OpSecretIcon } from '../op-secret/secret-icon';
import { Dialog, DialogFooter, DialogHeader } from '../ui/dialog';
import { mono, useToast } from '../ui/toast-provider';
import {
  getUsableFields,
  HASecretModalFieldList
} from './secret-modal-field-list';
import { useSecretModal } from './secret-modal-provider';
import { HASecretModalSave } from './secret-modal-save';

export type ModalItem = OpItem & { vault?: { name: string } | null };

type HASecretModalProps = {
  activeSecret: SecretRow;
  opItems: ModalItem[];
};

export const HASecretModal = ({
  activeSecret,
  opItems
}: HASecretModalProps) => {
  const t = useTranslations('secrets.modal');
  const tBroken = useTranslations('secrets.broken');
  const tList = useTranslations('secrets.list');
  const tActions = useTranslations('common.actions');
  const tToast = useTranslations('toast');
  const toast = useToast();
  const { closeModal } = useSecretModal();
  const titleId = useId();
  const listId = useId();

  const { broken, reference } = activeSecret;
  // A missing field keeps its item selected; a missing item opens on search.
  const startItem =
    broken === 'item' || broken === 'vault'
      ? null
      : (opItems.find(({ id }) => id === activeSecret.itemId) ?? null);

  const [item, setItem] = useState<ModalItem | null>(startItem);
  const [selectedRef, setSelectedRef] = useState<string | null>(
    broken ? null : reference
  );
  const [isLoadingFields, setIsLoadingFields] = useState(!!startItem?.vaultId);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [saveError, setSaveError] = useState<string | undefined>();
  const latestRequest = useRef(0);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return opItems.filter(
      ({ title, additionalInfo, vault }) =>
        !needle ||
        [title, additionalInfo, vault?.name]
          .join(' ')
          .toLowerCase()
          .includes(needle)
    );
  }, [opItems, query]);

  // Results can shrink under the cursor
  const cursor = Math.min(activeIndex, results.length - 1);

  // Fields are loaded on demand: the item list doesn't carry their details.
  const loadFields = useCallback(
    async (target: ModalItem, autoSelect: boolean) => {
      const request = ++latestRequest.current;
      let loaded = target;
      try {
        const result = target.vaultId
          ? await fetchOpItemFields(target.id, target.vaultId)
          : null;
        if (result?.success && result.item) {
          loaded = {
            ...target,
            fields: result.item.fields,
            urls: result.item.urls
          };
        }
      } catch (error) {
        console.error('Failed to fetch fields:', error);
      }

      if (request !== latestRequest.current) return;

      setItem(loaded);
      setIsLoadingFields(false);
      if (autoSelect) {
        const usable = getUsableFields(loaded.fields);
        if (usable.length === 1) {
          setSelectedRef(usable[0].reference as string);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (startItem?.vaultId) {
      void loadFields(startItem, !!broken);
    }
    // Only for the item the dialog opened with; picks load their own fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (picked: ModalItem) => {
    setItem(picked);
    setSelectedRef(null);
    setIsLoadingFields(true);
    void loadFields(picked, true);
  };

  const changeItem = () => {
    latestRequest.current++;
    setItem(null);
    setSelectedRef(null);
    setIsLoadingFields(false);
  };

  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(Math.min(cursor + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(Math.max(cursor - 1, 0));
    } else if (event.key === 'Enter' && results[cursor]) {
      event.preventDefault();
      pick(results[cursor]);
    }
  };

  const selectedField = item?.fields?.find(
    (field) => field.reference === selectedRef
  );
  const changed = !!selectedField && selectedRef !== reference;

  const handleSaved = () => {
    const key = broken ? 'relinked' : reference ? 'updated' : 'assigned';
    toast({ text: tToast.rich(key, { name: activeSecret.id, code: mono }) });
    closeModal();
  };

  const title = broken
    ? tBroken('relinkTitle')
    : reference
      ? t('changeTitle')
      : t('assignTitle');
  const saveLabel = broken
    ? tBroken('relink')
    : reference
      ? tActions('save')
      : tActions('assign');

  return (
    <Dialog onClose={closeModal} labelledBy={titleId}>
      <DialogHeader
        id={titleId}
        title={title}
        subtitle={activeSecret.id}
        onClose={closeModal}
      />

      <div className="space-y-5 overflow-y-auto px-5 pb-5 sm:px-6">
        {saveError && (
          <div role="alert" className="alert alert-error alert-soft">
            {saveError}
          </div>
        )}

        {broken && activeSecret.ref && (
          <div className="rounded-field border-error/30 bg-error/8 flex gap-2.5 border px-3 py-2.5 text-[13px]">
            <WarningIcon size={15} className="text-error mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div>
                <span className="text-error font-medium">
                  {tBroken(`short.${broken}`)}.
                </span>{' '}
                {tBroken(broken, activeSecret.ref)}.
              </div>
              <div className="mt-1 flex min-w-0 items-center gap-1.5">
                <span className="text-muted shrink-0 text-[12px]">
                  {tBroken('was')}
                </span>
                <ItemRef
                  reference={activeSecret.ref}
                  stale={broken === 'vault' ? null : broken}
                  fieldAriaLabel={tList('fieldAria', {
                    label: activeSecret.ref.fieldLabel
                  })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: the 1Password item */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base-content/80 text-[12.5px] font-medium">
              {t('item')}
            </h3>
            {item && (
              <button
                type="button"
                onClick={changeItem}
                className="link link-hover text-primary text-[12.5px]"
              >
                {t('changeItem')}
              </button>
            )}
          </div>

          {item ? (
            <div className="rounded-field border-base-content/25 bg-base-content/4 flex items-center gap-3 border p-3">
              <OpSecretIcon urls={item.urls} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium">
                  {item.title}
                </div>
                {item.additionalInfo && (
                  <div className="text-muted truncate text-[12.5px]">
                    {item.additionalInfo}
                  </div>
                )}
              </div>
              {item.vault?.name && (
                <span className="badge badge-sm badge-ghost shrink-0">
                  {item.vault.name}
                </span>
              )}
            </div>
          ) : (
            <div className="rounded-field hairline overflow-hidden border">
              <label className="hairline surface flex h-10 items-center gap-2 border-b px-3">
                <MagnifyingGlassIcon size={14} className="opacity-55" />
                <input
                  data-autofocus
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onSearchKey}
                  placeholder={t('searchLabel')}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13.5px] outline-none"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-activedescendant={
                    results[cursor]
                      ? `${listId}-${results[cursor].id}`
                      : undefined
                  }
                />
                <span className="text-muted text-[11.5px] tabular-nums">
                  {t('itemCount', { count: results.length })}
                </span>
              </label>
              <ul
                id={listId}
                role="listbox"
                className="max-h-60 overflow-y-auto py-1"
              >
                {results.map((result, index) => (
                  <li
                    key={result.id}
                    id={`${listId}-${result.id}`}
                    role="option"
                    aria-selected={index === cursor}
                    onMouseMove={() =>
                      index !== activeIndex && setActiveIndex(index)
                    }
                    onClick={() => pick(result)}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${index === cursor ? 'bg-base-content/8' : ''}`}
                  >
                    <OpSecretIcon urls={result.urls} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px]">
                        {result.title}
                      </div>
                      {result.additionalInfo && (
                        <div className="text-muted truncate text-[12px]">
                          {result.additionalInfo}
                        </div>
                      )}
                    </div>
                    {result.vault?.name && (
                      <span className="text-muted shrink-0 text-[11.5px]">
                        {result.vault.name}
                      </span>
                    )}
                  </li>
                ))}
                {results.length === 0 && (
                  <li className="text-muted px-3 py-8 text-center text-[13px]">
                    {t('noItems', { query })}
                  </li>
                )}
              </ul>
            </div>
          )}
        </section>

        {/* Step 2: the field */}
        {item && (
          <section className="fade-in">
            <h3 className="text-base-content/80 mb-2 text-[12.5px] font-medium">
              {t('field')}
            </h3>
            {isLoadingFields ? (
              <div
                className="space-y-1.5"
                aria-busy="true"
                aria-label={t('loadingItems')}
              >
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="skeleton rounded-field h-11 w-full"
                  />
                ))}
              </div>
            ) : (
              <HASecretModalFieldList
                fields={item.fields ?? []}
                selected={selectedRef}
                onSelect={setSelectedRef}
              />
            )}
          </section>
        )}

        {/* The add-on writes the field's value, not the reference. */}
        {selectedField && !isLoadingFields && (
          <section className="fade-in">
            <h3 className="text-base-content/80 mb-2 text-[12.5px] font-medium">
              {t('preview')}
            </h3>
            <div className="rounded-field hairline surface flex min-w-0 items-center gap-2 border px-3 py-2 font-mono text-[12.5px]">
              <span className="shrink-0">{activeSecret.id}:</span>
              <span className="text-muted flex items-center gap-1.5 truncate">
                {selectedField.type === 'CONCEALED' && (
                  <LockSimpleIcon size={11} className="shrink-0" />
                )}
                {selectedField.value}
              </span>
            </div>
          </section>
        )}
      </div>

      <DialogFooter
        left={
          <span className="text-muted hidden text-[12px] sm:inline">
            {t('syncsNext')}
          </span>
        }
      >
        <HASecretModalSave
          activeSecretId={activeSecret.id}
          opSecretId={item?.id ?? ''}
          reference={selectedRef ?? ''}
          label={saveLabel}
          disabled={!changed}
          onClose={closeModal}
          onSuccess={handleSaved}
          onError={setSaveError}
        />
      </DialogFooter>
    </Dialog>
  );
};
