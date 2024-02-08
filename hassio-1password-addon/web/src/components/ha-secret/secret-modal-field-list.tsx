'use client';

import { Field, ResponseFieldType } from '@1password/op-js';
import { Select, SelectItem, Selection } from '@nextui-org/react';

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
  const cleanFields = fields!.filter(
    (item) => !categoriesToSkip.includes(item.type) && item.value
  );

  return (
    <Select
      label="1password field"
      selectedKeys={reference}
      placeholder={
        !fields?.length
          ? 'No fields found. Press the button to sync the fields →'
          : undefined
      }
      multiple={false}
      onSelectionChange={onSelectionChange}
    >
      {cleanFields.map((field) => (
        <SelectItem
          key={field.reference as string}
          description={field.value}
          value={field.reference}
          textValue={field.label}
        >
          {field.label}
        </SelectItem>
      ))}
    </Select>
  );
};
