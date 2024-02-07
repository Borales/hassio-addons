'use client';

import { assignSecret } from '@/actions/assign-secret';
import { refreshOpSecret } from '@/actions/refresh-op-secret';
import { OpItem } from '@/service/1password.service';
import type { ResponseFieldType } from '@1password/op-js';
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Code,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem
} from '@nextui-org/react';
import { ArrowClockwise } from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OpSecretIcon } from '../op-secret/secret-icon';
import { Item } from './secret-item';

// Replace the middle part of the password with asterisks
// leaving the first and the last X characters visible
const maskPassword = (password: string, numChars: number = 2): string => {
  if (password.length <= 2 * numChars) {
    return '***';
  }
  return `${password.slice(0, numChars)}***${password.slice(-numChars)}`;
};

const categoriesToSkip: ResponseFieldType[] = ['OTP'];

type HASecretModalProps = {
  activeSecret?: Item | null;
  opItems: OpItem[];
};

export const HASecretModal = ({
  activeSecret,
  opItems
}: HASecretModalProps) => {
  const nav = useRouter();
  const [opSecretId, setOpSecretId] = useState<string | number>(
    activeSecret?.itemId || ''
  );
  const [reference, setReference] = useState<Set<string | number>>(
    new Set([activeSecret?.reference || ''])
  );

  const selectedOpItem = opItems.find((item) => item.id === opSecretId);

  return (
    <Modal
      backdrop="blur"
      size="xl"
      isOpen={!!activeSecret}
      onClose={() => {
        nav.push('/');
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              Assign&nbsp;<Code className="font-bold">{activeSecret?.id}</Code>
            </ModalHeader>
            <ModalBody>
              <Autocomplete
                fullWidth
                autoFocus={false}
                selectedKey={opSecretId}
                onSelectionChange={(key: string | number) => {
                  setReference(new Set([]));
                  setOpSecretId(key || '');
                }}
                isRequired
                label="1password item"
              >
                {opItems.map((item) => (
                  <AutocompleteItem
                    key={item.id}
                    value={item.id}
                    textValue={`${item.title} (${item.additionalInfo})`}
                    description={item.additionalInfo}
                    startContent={
                      <OpSecretIcon urls={item.urls} alt={item.title} />
                    }
                  >
                    {item.title}
                  </AutocompleteItem>
                ))}
              </Autocomplete>

              {selectedOpItem && (
                <>
                  <div className="flex items-center gap-2">
                    <Select
                      label="1password field"
                      selectedKeys={reference}
                      multiple={false}
                      onSelectionChange={setReference as any}
                    >
                      {selectedOpItem.fields
                        .filter(
                          (item) =>
                            !categoriesToSkip.includes(item.type) && item.value
                        )
                        .map((field, index) => (
                          <SelectItem
                            key={field.reference as string}
                            description={`${field.type === 'CONCEALED' ? maskPassword(field.value) : field.value}`}
                            value={field.reference}
                            textValue={field.label}
                          >
                            {field.label}
                          </SelectItem>
                        ))}
                    </Select>
                    <form action={refreshOpSecret}>
                      <input
                        type="hidden"
                        name="opSecretId"
                        value={selectedOpItem.id}
                      />
                      <input
                        type="hidden"
                        name="opVaultId"
                        value={selectedOpItem.vaultId as string}
                      />

                      <Button
                        size="lg"
                        isIconOnly
                        color="primary"
                        variant="bordered"
                        type="submit"
                        title="Refetch fields"
                      >
                        <ArrowClockwise />
                      </Button>
                    </form>
                  </div>

                  {(reference as Set<any>).size > 0 && (
                    <Code color="success" className="w-fit text-xs" size="sm">
                      {Array.from(reference).join(', ')}
                    </Code>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <form action={assignSecret}>
                <input
                  type="hidden"
                  name="haSecretId"
                  value={activeSecret?.id}
                />
                <input type="hidden" name="opSecretId" value={opSecretId} />
                <input
                  type="hidden"
                  name="ref"
                  value={Array.from(reference).join(', ')}
                />

                <Button
                  color="default"
                  size="sm"
                  className="mr-4"
                  variant="shadow"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  size="sm"
                  variant="shadow"
                >
                  Save
                </Button>
              </form>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
