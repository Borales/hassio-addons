// @vitest-environment happy-dom
import { ActionButtons } from '@/components/ui/action-buttons';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('ActionButtons', () => {
  it('renders children inside the container', () => {
    render(
      <ActionButtons>
        <button>Edit</button>
        <button>Delete</button>
      </ActionButtons>
    );

    expect(screen.getByText('Edit')).toBeDefined();
    expect(screen.getByText('Delete')).toBeDefined();
  });

  it('applies default flex layout classes', () => {
    const { container } = render(
      <ActionButtons>
        <button>Action</button>
      </ActionButtons>
    );

    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('flex');
    expect(div.className).toContain('items-center');
    expect(div.className).toContain('justify-end');
    expect(div.className).toContain('gap-1');
  });

  it('applies custom className alongside default classes', () => {
    const { container } = render(
      <ActionButtons className="my-custom-class">
        <button>Action</button>
      </ActionButtons>
    );

    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('my-custom-class');
    expect(div.className).toContain('flex');
  });

  it('renders without className prop', () => {
    const { container } = render(
      <ActionButtons>
        <span>child</span>
      </ActionButtons>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toBeDefined();
    expect(div.className).not.toContain('undefined');
  });

  it('renders a single child', () => {
    render(
      <ActionButtons>
        <button>Only Action</button>
      </ActionButtons>
    );

    expect(screen.getByText('Only Action')).toBeDefined();
  });
});
