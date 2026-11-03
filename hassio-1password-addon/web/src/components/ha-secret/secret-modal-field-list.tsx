'use client';

import { Field, ResponseFieldType } from '@1password/op-js';
import { LockSimpleIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

const typesToSkip: ResponseFieldType[] = ['OTP', 'UNKNOWN'];

/** Fields that can be written to secrets.yaml. */
export const getUsableFields = (fields: Field[] = []) =>
  fields.filter((field) => !typesToSkip.includes(field.type) && field.value);

type HASecretModalFieldListProps = {
  fields: Field[];
  /** The selected field's reference. */
  selected: string | null;
  onSelect: (reference: string) => void;
};

export const HASecretModalFieldList = ({
  fields,
  selected,
  onSelect
}: HASecretModalFieldListProps) => {
  const t = useTranslations('secrets.modal');
  const usable = getUsableFields(fields);
  const hasOtp = fields.some((field) => field.type === 'OTP');

  if (usable.length === 0) {
    return (
      <p className="text-muted text-[13px]">{t('fieldItemPlaceholder')}</p>
    );
  }

  return (
    <>
      <div
        role="radiogroup"
        aria-label={t('field')}
        className="rounded-field hairline divide-base-content/10 divide-y overflow-hidden border"
      >
        {usable.map((field) => {
          const reference = field.reference as string;
          const isSelected = selected === reference;
          return (
            <label
              key={reference}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors ${isSelected ? 'bg-base-content/6' : 'hover:bg-base-content/4'}`}
            >
              <input
                type="radio"
                name="field"
                className="radio radio-sm radio-primary"
                checked={isSelected}
                onChange={() => onSelect(reference)}
              />
              <span className="min-w-0 flex-1 truncate text-[13.5px]">
                {field.label}
              </span>
              <span className="text-muted flex max-w-[45%] items-center gap-1.5 truncate font-mono text-[12px]">
                {field.type === 'CONCEALED' && (
                  <LockSimpleIcon size={11} className="shrink-0" />
                )}
                {field.value}
              </span>
            </label>
          );
        })}
      </div>
      {hasOtp && (
        <p className="text-muted mt-1.5 text-[12px]">{t('otpHidden')}</p>
      )}
    </>
  );
};
