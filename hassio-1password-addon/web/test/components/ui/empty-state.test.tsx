// @vitest-environment happy-dom
import { FileIcon } from '@phosphor-icons/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('renders the icon, title, body and action', () => {
    const { container } = render(
      <EmptyState icon={FileIcon} title="Nothing" action={<button>Add</button>}>
        Body
      </EmptyState>
    );

    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByText('Nothing')).toBeDefined();
    expect(screen.getByText('Body')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDefined();
  });

  it('works with only a title', () => {
    render(<EmptyState icon={FileIcon} title="Nothing" />);

    expect(screen.getByText('Nothing')).toBeDefined();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
