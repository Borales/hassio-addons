// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../../helpers/next-intl';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import { RateLimitWarningBanner } from '@/components/rate-limit/warning-banner';

describe('RateLimitWarningBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing without warnings', () => {
    const { container } = render(<RateLimitWarningBanner warnings={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('names the limits that are running out', () => {
    render(<RateLimitWarningBanner warnings={['daily', 'hourlyReads']} />);

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'title' })).toBeDefined();
    expect(t).toHaveBeenCalledWith('description', {
      limits: 'labels.daily, labels.hourlyReads'
    });
  });

  it('passes through a limit it has no label for', () => {
    render(<RateLimitWarningBanner warnings={['weekly']} />);

    expect(t).toHaveBeenCalledWith('description', { limits: 'weekly' });
  });

  it('links to the rate limits page', () => {
    render(<RateLimitWarningBanner warnings={['daily']} />);

    expect(
      screen.getByRole('link', { name: 'viewDetails' }).getAttribute('href')
    ).toBe('./rate-limits');
  });
});
