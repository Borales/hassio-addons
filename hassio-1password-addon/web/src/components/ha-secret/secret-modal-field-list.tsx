'use client';

import { Field, ResponseFieldType } from '@1password/op-js';
import { Select, SelectItem, Selection } from '@heroui/react';
import { useTranslations } from 'next-intl';

type HASecretModalFieldListProps = {
  reference: Set<string | number>;
  fields?: Field[];
  onSelectionChange: ((keys: Selection) => any) | undefined;
};

const categoriesToSkip: ResponseFieldType[] = ['OTP', 'UNKNOWN'];

export const HASecretModalFieldList = ({
  reference,
  fields,
  onSelectionChange
}: HASecretModalFieldListProps) => {
  const t = useTranslations('secrets.modal');
  const cleanFields = fields!.filter(
    (item) => !categoriesToSkip.includes(item.type) && item.value
  );

  return (
    <Select
      label={t('fieldItemLabel')}
      selectedKeys={reference}
      placeholder={!fields?.length ? t('fieldItemPlaceholder') : undefined}
      selectionMode="single"
      onSelectionChange={onSelectionChange}
      items={cleanFields}
    >
      {(field) => (
        <SelectItem
          key={field.reference as string}
          description={field.value}
          textValue={field.label}
        >
          {field.label}
        </SelectItem>
      )}
    </Select>
  );
};
