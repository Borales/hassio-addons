'use client';

import { OpItem } from '@/service/1password.service';
import {
  Autocomplete,
  AutocompleteItem,
  Code,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OpSecretIcon } from '../op-secret/secret-icon';
import { Item } from './secret-item';
import { HASecretModalFetchFields } from './secret-modal-fetch-fields';
import { HASecretModalFieldList } from './secret-modal-field-list';
import { HASecretModalSave } from './secret-modal-save';

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
                    <HASecretModalFieldList
                      onSelectionChange={setReference as any}
                      reference={reference}
                      fields={selectedOpItem.fields}
                    />
                    <HASecretModalFetchFields
                      id={selectedOpItem.id}
                      vaultId={selectedOpItem.vaultId as string}
                    />
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
              <HASecretModalSave
                onClose={onClose}
                activeSecretId={activeSecret?.id as string}
                opSecretId={opSecretId}
                reference={Array.from(reference).join(', ')}
              />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
