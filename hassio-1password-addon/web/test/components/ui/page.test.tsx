// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageContainer, PageHeader } from '@/components/ui/page';

describe('PageContainer', () => {
  it('renders its children', () => {
    render(<PageContainer>content</PageContainer>);
    expect(screen.getByText('content')).toBeDefined();
  });
});

describe('PageHeader', () => {
  it('renders the title as the page heading, with description and actions', () => {
    render(
      <PageHeader
        title="Title"
        description="Description"
        actions={<button>Act</button>}
      />
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Title' })
    ).toBeDefined();
    expect(screen.getByText('Description')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Act' })).toBeDefined();
  });

  it('leaves out the empty description and actions slots', () => {
    const { container } = render(<PageHeader title="Title" />);

    expect(container.querySelector('p')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
