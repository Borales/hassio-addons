// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import { Dialog, DialogFooter, DialogHeader } from '@/components/ui/dialog';

describe('Dialog', () => {
  it('opens as a modal on mount, named by its title', () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');

    render(
      <Dialog onClose={vi.fn()} labelledBy="title">
        <h2 id="title">Heading</h2>
      </Dialog>
    );

    expect(showModal).toHaveBeenCalledOnce();
    expect(
      screen.getByRole<HTMLDialogElement>('dialog', { name: 'Heading' }).open
    ).toBe(true);
    showModal.mockRestore();
  });

  it('focuses the field marked for autofocus', () => {
    render(
      <Dialog onClose={vi.fn()} labelledBy="title">
        <button>First</button>
        <input aria-label="primary" data-autofocus />
      </Dialog>
    );

    expect(document.activeElement).toBe(screen.getByLabelText('primary'));
  });

  it('reports closing by Esc or backdrop, which fire the native close event', () => {
    const onClose = vi.fn();
    render(
      <Dialog onClose={onClose} labelledBy="title">
        content
      </Dialog>
    );

    fireEvent(screen.getByRole('dialog'), new Event('close'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('offers a backdrop that closes the dialog natively', () => {
    render(
      <Dialog onClose={vi.fn()} labelledBy="title">
        content
      </Dialog>
    );

    const backdrop = screen.getByRole('button', { name: 'close' });
    expect(backdrop.closest('form')?.getAttribute('method')).toBe('dialog');
  });
});

describe('DialogHeader', () => {
  it('renders the title under the given id, with an optional subtitle', () => {
    const { rerender } = render(
      <DialogHeader id="t" title="Title" subtitle="sub" onClose={vi.fn()} />
    );

    expect(screen.getByRole('heading', { name: 'Title' }).id).toBe('t');
    expect(screen.getByText('sub')).toBeDefined();

    rerender(<DialogHeader id="t" title="Title" onClose={vi.fn()} />);
    expect(screen.queryByText('sub')).toBeNull();
  });

  it('closes from its close button', () => {
    const onClose = vi.fn();
    render(<DialogHeader id="t" title="Title" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'close' }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('DialogFooter', () => {
  it('renders the left slot and the actions', () => {
    render(<DialogFooter left="hint">action</DialogFooter>);

    expect(screen.getByText('hint')).toBeDefined();
    expect(screen.getByText('action')).toBeDefined();
  });
});
