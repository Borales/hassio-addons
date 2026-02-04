'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { ReactElement, useState } from 'react';

type ConfirmDialogProps = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'danger' | 'warning';
  onConfirm: () => void | Promise<void>;
  trigger: (onOpen: () => void) => ReactElement;
};

export const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmColor = 'primary',
  onConfirm,
  trigger
}: ConfirmDialogProps) => {
  const t = useTranslations('confirmDialog');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {trigger(onOpen)}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>{title || t('title')}</ModalHeader>
          <ModalBody>
            <p>{message}</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isProcessing}>
              {cancelLabel || t('cancel')}
            </Button>
            <Button
              color={confirmColor}
              onPress={handleConfirm}
              isLoading={isProcessing}
            >
              {confirmLabel || t('confirm')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
