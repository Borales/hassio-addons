// @vitest-environment happy-dom
import { siteConfig } from '@/config/site';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => import('../helpers/next-intl'));

import { ServiceAccountWarning } from '@/components/service-account-warning';

describe('ServiceAccountWarning', () => {
  it('alerts with the title and a description that renders its code tag', () => {
    const { container } = render(<ServiceAccountWarning />);

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'title' })).toBeDefined();
    expect(screen.getByText('description')).toBeDefined();
    expect(container.querySelector('code')?.textContent).toBe('code');
  });

  it('links to the setup docs in a new tab', () => {
    render(<ServiceAccountWarning />);

    const link = screen.getByRole('link', { name: 'setup' });
    expect(link.getAttribute('href')).toBe(siteConfig.serviceAccountDocs);
    expect(link.getAttribute('target')).toBe('_blank');
  });
});
