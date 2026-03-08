// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@heroui/react', () => ({
  Chip: ({
    children,
    classNames
  }: {
    children: React.ReactNode;
    classNames?: Record<string, string>;
  }) => (
    <span data-testid="chip" className={classNames?.base}>
      {children}
    </span>
  ),
  Tooltip: ({
    children,
    content
  }: {
    children: React.ReactNode;
    content: string;
  }) => (
    <div data-testid="tooltip" data-content={content}>
      {children}
    </div>
  )
}));

import { ChipList } from '@/components/ui/chip-list';

const makeItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    label: `Item ${i}`
  }));

describe('ChipList', () => {
  it('renders empty message when items array is empty', () => {
    render(<ChipList items={[]} emptyMessage="No items found" />);
    expect(screen.getByText('No items found')).toBeDefined();
  });

  it('renders default empty message when no emptyMessage prop provided', () => {
    render(<ChipList items={[]} />);
    expect(screen.getByText('No items')).toBeDefined();
  });

  it('renders all items when count is within maxVisible', () => {
    const items = makeItems(3);
    render(<ChipList items={items} maxVisible={4} />);

    expect(screen.getByText('Item 0')).toBeDefined();
    expect(screen.getByText('Item 1')).toBeDefined();
    expect(screen.getByText('Item 2')).toBeDefined();
  });

  it('renders only maxVisible items and an overflow chip', () => {
    const items = makeItems(6);
    render(<ChipList items={items} maxVisible={4} />);

    expect(screen.getByText('Item 0')).toBeDefined();
    expect(screen.getByText('Item 3')).toBeDefined();
    expect(screen.queryByText('Item 4')).toBeNull();
    expect(screen.getByText('+2')).toBeDefined();
  });

  it('shows overflow tooltip with remaining item labels', () => {
    const items = makeItems(6);
    render(<ChipList items={items} maxVisible={4} />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip.getAttribute('data-content')).toBe('Item 4, Item 5');
  });

  it('does not render overflow chip when items fit within maxVisible', () => {
    const items = makeItems(4);
    render(<ChipList items={items} maxVisible={4} />);

    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  it('uses custom renderChip when provided', () => {
    const items = [{ id: 'a', label: 'Custom A' }];
    render(
      <ChipList
        items={items}
        renderChip={(item) => (
          <span key={item.id} data-testid="custom-chip">
            {item.label}
          </span>
        )}
      />
    );

    expect(screen.getByTestId('custom-chip')).toBeDefined();
    expect(screen.getByText('Custom A')).toBeDefined();
  });

  it('renders exactly maxVisible chips when items equal maxVisible', () => {
    const items = makeItems(4);
    render(<ChipList items={items} maxVisible={4} />);

    const chips = screen.getAllByTestId('chip');
    expect(chips.length).toBe(4);
  });

  it('renders 1 item correctly', () => {
    const items = [{ id: 'single', label: 'Only One' }];
    render(<ChipList items={items} />);

    expect(screen.getByText('Only One')).toBeDefined();
    expect(screen.queryByText(/^\+/)).toBeNull();
  });
});
