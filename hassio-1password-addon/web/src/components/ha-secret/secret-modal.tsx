'use client';

import { fetchOpItemFields } from '@/actions/refresh-op-secret';
import { HaSecret, OpItem } from '@/service/1password.service';
import {
  Autocomplete,
  AutocompleteItem,
  Code,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OpSecretIcon } from '../op-secret/secret-icon';
import { HASecretModalFieldList } from './secret-modal-field-list';
import { HASecretModalSave } from './secret-modal-save';

export type Item = Pick<
  HaSecret,
  'id' | 'isSkipped' | 'itemId' | 'updatedAt' | 'reference'
>;

type HASecretModalProps = {
  activeSecret?: Item | null;
  opItems: OpItem[];
};

const getItemTextValue = (item: OpItem) =>
  item.additionalInfo ? `${item.title} (${item.additionalInfo})` : item.title;

export const HASecretModal = ({
  activeSecret,
  opItems
}: HASecretModalProps) => {
  const t = useTranslations('secrets.modal');
  const nav = useRouter();
  const [opSecretId, setOpSecretId] = useState<string | number>(
    activeSecret?.itemId || ''
  );
  const [reference, setReference] = useState<Set<string | number>>(
    new Set([activeSecret?.reference || ''])
  );
  const [selectedOpItem, setSelectedOpItem] = useState<OpItem | undefined>(
    opItems.find((item) => item.id === opSecretId)
  );
  const [isLoadingFields, setIsLoadingFields] = useState(false);

  // Auto-fetch fresh fields when the selected item ID changes
  useEffect(() => {
    const fetchFields = async () => {
      if (!opSecretId) {
        setSelectedOpItem(undefined);
        return;
      }

      const item = opItems.find((item) => item.id === opSecretId);
      if (!item || !item.vaultId) {
        setSelectedOpItem(item);
        return;
      }

      setIsLoadingFields(true);
      try {
        const result = await fetchOpItemFields(item.id, item.vaultId);
        if (result.success && result.item) {
          setSelectedOpItem({
            ...item,
            fields: result.item.fields,
            urls: result.item.urls
          });
        } else {
          setSelectedOpItem(item);
        }
      } catch (error) {
        console.error('Failed to fetch fields:', error);
        setSelectedOpItem(item);
      } finally {
        setIsLoadingFields(false);
      }
    };

    fetchFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opSecretId]);

  return (
    <Modal
      backdrop="blur"
      size="xl"
      isOpen={!!activeSecret}
      onClose={() => {
        nav.push('./');
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {t('title')}&nbsp;
              <Code className="font-bold">{activeSecret?.id}</Code>
            </ModalHeader>
            <ModalBody>
              <Autocomplete
                fullWidth
                autoFocus={false}
                selectedKey={opSecretId}
                onSelectionChange={(key) => {
                  setReference(new Set([]));
                  setOpSecretId(key || '');
                }}
                defaultItems={opItems}
                isRequired
                label={t('searchLabel')}
                itemHeight={64}
              >
                {(item: OpItem) => (
                  <AutocompleteItem
                    key={item.id}
                    textValue={getItemTextValue(item)}
                    description={item.additionalInfo}
                    startContent={
                      <OpSecretIcon urls={item.urls} alt={item.title} />
                    }
                    classNames={{
                      base: 'py-3 gap-3',
                      title: 'text-base',
                      description: 'text-sm'
                    }}
                  >
                    {item.title}
                  </AutocompleteItem>
                )}
              </Autocomplete>

              {isLoadingFields && (
                <div className="flex items-center justify-center p-4">
                  <Spinner label={t('loadingItems')} />
                </div>
              )}

              {!isLoadingFields && selectedOpItem && (
                <>
                  <HASecretModalFieldList
                    onSelectionChange={(value) =>
                      setReference(value as Set<string | number>)
                    }
                    reference={reference}
                    fields={selectedOpItem.fields}
                  />

                  {reference.size > 0 && (
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
                onSuccess={onClose}
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
