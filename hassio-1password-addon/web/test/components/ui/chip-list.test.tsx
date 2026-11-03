// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChipList } from '@/components/ui/chip-list';

const items = ['a', 'b', 'c', 'd'].map((id) => ({ id, label: `label-${id}` }));

describe('ChipList', () => {
  it('renders nothing without items', () => {
    const { container } = render(<ChipList items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows two items by default and folds the rest into an overflow chip', () => {
    render(<ChipList items={items} />);

    expect(screen.getByText('label-a')).toBeDefined();
    expect(screen.getByText('label-b')).toBeDefined();
    expect(screen.queryByText('label-c')).toBeNull();

    const overflow = screen.getByText('+2');
    expect(overflow.parentElement?.getAttribute('data-tip')).toBe(
      'label-c, label-d'
    );
  });

  it('has no overflow chip when everything fits', () => {
    render(<ChipList items={items} maxVisible={4} />);
    expect(screen.getByText('label-d')).toBeDefined();
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  it('builds the overflow text with overflowLabel', () => {
    render(
      <ChipList
        items={items}
        maxVisible={1}
        overflowLabel={(count) => `${count} more`}
      />
    );
    expect(screen.getByText('3 more')).toBeDefined();
  });

  it('renders the prefix in front of the label', () => {
    render(
      <ChipList items={[{ id: 'a', label: 'label-a', prefix: <i>dot</i> }]} />
    );
    expect(screen.getByText('label-a').textContent).toBe('dotlabel-a');
  });
});
