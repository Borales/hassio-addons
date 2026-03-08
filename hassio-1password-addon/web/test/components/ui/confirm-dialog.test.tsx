// @vitest-environment happy-dom

let mockIsOpen = false;
const mockOnOpen = vi.fn(() => {
  mockIsOpen = true;
});
const mockOnClose = vi.fn(() => {
  mockIsOpen = false;
});

vi.mock('@heroui/react', () => ({
  useDisclosure: () => ({
    isOpen: mockIsOpen,
    onOpen: mockOnOpen,
    onClose: mockOnClose
  }),
  Modal: ({
    isOpen,
    children
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => (isOpen ? <div data-testid="modal">{children}</div> : null),
  ModalContent: ({
    children
  }: {
    children: React.ReactNode | ((...args: any[]) => React.ReactNode);
  }) => (
    <div>{typeof children === 'function' ? children(() => {}) : children}</div>
  ),
  ModalHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-header">{children}</div>
  ),
  ModalBody: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-body">{children}</div>
  ),
  ModalFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-footer">{children}</div>
  ),
  Button: ({
    children,
    onPress,
    onClick,
    isDisabled,
    isLoading,
    color,
    variant,
    type
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    onClick?: () => void;
    isDisabled?: boolean;
    isLoading?: boolean;
    color?: string;
    variant?: string;
    type?: string;
  }) => (
    <button
      onClick={onPress || onClick}
      disabled={isDisabled}
      data-loading={isLoading}
      data-color={color}
      data-variant={variant}
      type={type as any}
    >
      {children}
    </button>
  )
}));

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';

describe('ConfirmDialog', () => {
  beforeEach(() => {
    mockIsOpen = false;
    mockOnOpen.mockClear();
    mockOnClose.mockClear();
  });

  it('renders the trigger element', () => {
    render(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );
    expect(screen.getByTestId('trigger-btn')).toBeDefined();
  });

  it('trigger element calls onOpen when clicked', () => {
    render(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );
    fireEvent.click(screen.getByTestId('trigger-btn'));
    expect(mockOnOpen).toHaveBeenCalledTimes(1);
  });

  it('modal is not visible initially (isOpen=false)', () => {
    const { container } = render(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );
    expect(container.querySelector('[data-testid="modal"]')).toBeNull();
  });

  it('after clicking trigger, modal becomes visible', () => {
    const { rerender } = render(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );

    act(() => {
      fireEvent.click(screen.getByTestId('trigger-btn'));
    });

    // mockIsOpen is now true, re-render to reflect state
    rerender(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );

    expect(screen.getByTestId('modal')).toBeDefined();
  });

  it('modal shows the message text', () => {
    mockIsOpen = true;
    render(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );
    expect(screen.getByTestId('modal-body').textContent).toContain(
      'Are you sure?'
    );
  });

  it('modal shows default title from translations when no title prop', () => {
    mockIsOpen = true;
    render(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );
    // useTranslations returns the key, so t('title') => 'title'
    expect(screen.getByTestId('modal-header').textContent).toBe('title');
  });

  it('modal shows custom title when title prop provided', () => {
    mockIsOpen = true;
    render(
      <ConfirmDialog
        title="Custom Title"
        message="Are you sure?"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );
    expect(screen.getByTestId('modal-header').textContent).toBe('Custom Title');
  });

  it('modal shows default cancel label from translations', () => {
    mockIsOpen = true;
    render(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );
    const footer = screen.getByTestId('modal-footer');
    // t('cancel') => 'cancel'
    expect(footer.textContent).toContain('cancel');
  });

  it('modal shows custom cancelLabel when provided', () => {
    mockIsOpen = true;
    render(
      <ConfirmDialog
        message="Are you sure?"
        cancelLabel="No thanks"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );
    const footer = screen.getByTestId('modal-footer');
    expect(footer.textContent).toContain('No thanks');
  });

  it('modal shows default confirm label from translations', () => {
    mockIsOpen = true;
    render(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );
    const footer = screen.getByTestId('modal-footer');
    // t('confirm') => 'confirm'
    expect(footer.textContent).toContain('confirm');
  });

  it('modal shows custom confirmLabel when provided', () => {
    mockIsOpen = true;
    render(
      <ConfirmDialog
        message="Are you sure?"
        confirmLabel="Yes, do it"
        onConfirm={vi.fn()}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );
    const footer = screen.getByTestId('modal-footer');
    expect(footer.textContent).toContain('Yes, do it');
  });

  it('clicking confirm button calls onConfirm', async () => {
    mockIsOpen = true;
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={onConfirm}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );

    const footer = screen.getByTestId('modal-footer');
    const buttons = footer.querySelectorAll('button');
    // Second button is the confirm button
    await act(async () => {
      fireEvent.click(buttons[1]);
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('onConfirm is awaited (async support)', async () => {
    mockIsOpen = true;
    let resolved = false;
    const onConfirm = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            resolved = true;
            resolve();
          }, 10)
        )
    );

    render(
      <ConfirmDialog
        message="Are you sure?"
        onConfirm={onConfirm}
        trigger={(onOpen) => (
          <button data-testid="trigger-btn" onClick={onOpen}>
            Open
          </button>
        )}
      />
    );

    const footer = screen.getByTestId('modal-footer');
    const buttons = footer.querySelectorAll('button');

    await act(async () => {
      fireEvent.click(buttons[1]);
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(resolved).toBe(true);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
