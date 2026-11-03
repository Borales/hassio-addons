// @vitest-environment happy-dom
import { CheckIcon, XCircleIcon } from '@phosphor-icons/react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import { mono, ToastProvider, useToast } from '@/components/ui/toast-provider';

type ToastInput = Parameters<ReturnType<typeof useToast>>[0];

const Trigger = ({ toast }: { toast: ToastInput }) => {
  const show = useToast();
  return <button onClick={() => show(toast)}>trigger</button>;
};

const show = (toast: ToastInput) => {
  const { unmount } = render(
    <ToastProvider>
      <Trigger toast={toast} />
    </ToastProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
  return unmount;
};

const iconMarkup = (
  Icon: typeof CheckIcon,
  props: ComponentProps<typeof Icon>
) => {
  const { container, unmount } = render(<Icon {...props} />);
  const markup = container.querySelector('svg')?.innerHTML;
  unmount();
  return markup;
};

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dismisses a plain toast after 2.5s', () => {
    show({ text: 'done' });
    expect(screen.getByRole('status').textContent).toContain('done');

    advance(2499);
    expect(screen.queryByRole('status')).not.toBeNull();

    advance(1);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('keeps a toast with undo for 5s', () => {
    show({ text: 'done', undo: vi.fn() });

    advance(4999);
    expect(screen.queryByRole('status')).not.toBeNull();

    advance(1);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('offers no undo unless given one', () => {
    show({ text: 'done' });
    expect(screen.queryByRole('button', { name: 'undo' })).toBeNull();
  });

  it('undo runs the callback and dismisses at once', () => {
    const undo = vi.fn();
    show({ text: 'done', undo });

    fireEvent.click(screen.getByRole('button', { name: 'undo' }));

    expect(undo).toHaveBeenCalledOnce();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('a new toast replaces the current one and restarts the timer', () => {
    const Both = () => {
      const toast = useToast();
      return (
        <>
          <button onClick={() => toast({ text: 'first' })}>one</button>
          <button onClick={() => toast({ text: 'second' })}>two</button>
        </>
      );
    };
    render(
      <ToastProvider>
        <Both />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'one' }));
    advance(2000);
    fireEvent.click(screen.getByRole('button', { name: 'two' }));
    advance(2000);

    expect(screen.getByRole('status').textContent).toBe('second');

    advance(500);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it.each([
    ['success', undefined, CheckIcon],
    ['error', 'error', XCircleIcon]
  ] as const)('shows the %s icon', (_name, tone, Icon) => {
    const expected = iconMarkup(Icon, { size: 16 });

    show({ text: 'done', tone });

    expect(screen.getByRole('status').querySelector('svg')?.innerHTML).toBe(
      expected
    );
  });
});

describe('useToast', () => {
  it('throws outside the provider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => render(<Trigger toast={{ text: 'x' }} />)).toThrow(
      'useToast must be used within ToastProvider'
    );

    consoleError.mockRestore();
  });
});

describe('mono', () => {
  it('renders the chunks', () => {
    render(<p>{mono('my_key')}</p>);
    expect(screen.getByText('my_key')).toBeDefined();
  });
});
