'use client';

import { createGroup } from '@/actions/group-create';
import { updateGroup } from '@/actions/group-update';
import { createTranslatedGroupNameSchema } from '@/lib/group-validation';
import { eventForGroup, SecretRow } from '@/lib/secret-status';
import { GroupWithSecrets } from '@/service/group.service';
import {
  CheckIcon,
  LightningIcon,
  MagnifyingGlassIcon
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useActionState, useId, useMemo, useState } from 'react';
import { CopyButton } from '../ui/copy-button';
import { Dialog, DialogFooter, DialogHeader } from '../ui/dialog';
import { EventName } from '../ui/event-name';
import { StatusDot } from '../ui/status-dot';
import { mono, useToast } from '../ui/toast-provider';
import { useGroupModal } from './group-modal-provider';

type GroupModalProps = {
  group: GroupWithSecrets | null;
  secrets: SecretRow[];
  /** Names of every existing group, for the duplicate-name check. */
  groupNames: string[];
  isNew: boolean;
};

/** Normalised as you type: lowercase, spaces become underscores. */
const normalizeName = (value: string) =>
  value.toLowerCase().replace(/\s+/g, '_');

export const GroupModal = ({
  group,
  secrets,
  groupNames,
  isNew
}: GroupModalProps) => {
  const t = useTranslations('groups.modal');
  const tCommon = useTranslations('common.actions');
  const tList = useTranslations('secrets.list');
  const tValidation = useTranslations('validation.groupName');
  const tToast = useTranslations('toast');
  const toast = useToast();
  const { closeModal } = useGroupModal();
  const titleId = useId();
  const nameHelpId = useId();

  const [name, setName] = useState(group?.name || '');
  const [touched, setTouched] = useState(false);
  const [description, setDescription] = useState(group?.description || '');
  const [selected, setSelected] = useState<Set<string>>(
    new Set(group?.secrets.map(({ secretId }) => secretId) || [])
  );
  const [query, setQuery] = useState('');

  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await (isNew ? createGroup : updateGroup)(formData);
      if (result.success) {
        toast({
          text: tToast.rich(isNew ? 'groupCreated' : 'groupSaved', {
            name,
            code: mono
          })
        });
        closeModal();
      }
      return result;
    },
    null
  );

  const schema = useMemo(
    () => createTranslatedGroupNameSchema(tValidation),
    [tValidation]
  );

  const nameError = !name
    ? tValidation('required')
    : (schema.safeParse(name).error?.issues[0].message ??
      (groupNames.includes(name) && name !== group?.name
        ? t('duplicate', { name })
        : null));
  const showNameError = touched && !!nameError;

  const needle = query.toLowerCase();
  const shown = secrets.filter(({ id }) => id.toLowerCase().includes(needle));

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const saveBlockedBy =
    nameError ?? (selected.size === 0 ? t('selectAtLeastOne') : null);
  const event = eventForGroup(nameError ? null : name);

  return (
    <Dialog onClose={closeModal} labelledBy={titleId} width="sm:max-w-[580px]">
      <DialogHeader
        id={titleId}
        title={isNew ? t('createTitle') : t('editTitle')}
        subtitle={group?.name}
        onClose={closeModal}
      />

      <form action={formAction} className="flex min-h-0 flex-col">
        {!isNew && <input type="hidden" name="groupId" value={group?.id} />}
        {Array.from(selected).map((secretId) => (
          <input
            key={secretId}
            type="hidden"
            name="secretIds"
            value={secretId}
          />
        ))}

        <div className="space-y-4 overflow-y-auto px-5 pt-2 pb-5 sm:px-6">
          {state && !state.success && state.error && (
            <div role="alert" className="alert alert-error alert-soft">
              {state.error}
            </div>
          )}

          <div>
            <label className="floating-label">
              <span>{t('nameLabel')}</span>
              <input
                name="name"
                autoComplete="off"
                value={name}
                onChange={(e) => {
                  setName(normalizeName(e.target.value));
                  setTouched(true);
                }}
                onBlur={() => setTouched(true)}
                placeholder={t('nameLabel')}
                maxLength={60}
                className={`input w-full font-mono ${showNameError ? 'input-error' : ''}`}
                aria-invalid={showNameError}
                aria-describedby={nameHelpId}
                data-autofocus={isNew ? true : undefined}
              />
            </label>
            <p
              id={nameHelpId}
              className={`mt-1.5 text-[12px] ${showNameError ? 'text-error' : 'text-muted'}`}
            >
              {showNameError ? nameError : t('nameDescription')}
            </p>
          </div>

          <label className="floating-label block">
            <span>{t('descriptionLabel')}</span>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={t('descriptionLabel')}
              className="textarea w-full resize-none"
            />
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12.5px] font-medium">
                {t('secretsLabel')}{' '}
                <span className="text-muted ml-1 font-normal tabular-nums">
                  {t('selectedCount', { count: selected.size })}
                </span>
              </span>
              <span className="flex gap-3 text-[12px]">
                <button
                  type="button"
                  onClick={() =>
                    setSelected(
                      new Set([...selected, ...shown.map(({ id }) => id)])
                    )
                  }
                  className="link link-hover text-primary"
                >
                  {query ? t('selectShown') : t('selectAll')}
                </button>
                {selected.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="link link-hover text-muted"
                  >
                    {t('clear')}
                  </button>
                )}
              </span>
            </div>

            <div className="rounded-field hairline overflow-hidden border">
              <label className="hairline surface flex h-9 items-center gap-2 border-b px-3">
                <MagnifyingGlassIcon size={13} className="opacity-55" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                  placeholder={t('filterSecrets')}
                  aria-label={t('filterSecrets')}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] outline-none"
                />
              </label>
              <div className="divide-base-content/8 max-h-56 divide-y overflow-y-auto">
                {shown.map((secret) => (
                  <label
                    key={secret.id}
                    className="hover:bg-base-content/4 flex cursor-pointer items-center gap-3 px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={selected.has(secret.id)}
                      onChange={() => toggle(secret.id)}
                    />
                    <StatusDot status={secret.status} />
                    <span className="flex-1 truncate font-mono text-[13px]">
                      {secret.id}
                    </span>
                    <span
                      className={`text-[11.5px] ${secret.status === 'broken' ? 'text-error' : 'text-muted'}`}
                    >
                      {secret.status === 'assigned'
                        ? secret.ref?.item
                        : tList(`status.${secret.status}`)}
                    </span>
                  </label>
                ))}
                {shown.length === 0 && (
                  <div className="text-muted px-3 py-6 text-center text-[12.5px]">
                    {t('noSecretsMatch', { query })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter
          left={
            <div className="flex min-w-0 items-center gap-0.5">
              <span
                className="inline-flex min-w-0 items-center gap-1.5"
                title={t('eventHint')}
              >
                <LightningIcon size={12} className="text-muted shrink-0" />
                <EventName name={event} className="truncate" />
              </span>
              {!nameError && (
                <CopyButton text={event} label={t('copyEvent')} size={12} />
              )}
            </div>
          }
        >
          <button
            type="button"
            onClick={closeModal}
            className="btn btn-sm btn-ghost"
          >
            {tCommon('cancel')}
          </button>
          <span
            className={saveBlockedBy ? 'tooltip tooltip-left' : ''}
            data-tip={saveBlockedBy ?? undefined}
          >
            <button
              type="submit"
              disabled={isPending || !!saveBlockedBy}
              className="btn btn-sm btn-primary gap-1.5"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <CheckIcon size={14} />
              )}
              {isNew ? t('createAction') : tCommon('save')}
            </button>
          </span>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
