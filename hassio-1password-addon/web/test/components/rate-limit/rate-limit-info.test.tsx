// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { t } from '../../helpers/next-intl';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import { RateLimitInfo } from '@/components/rate-limit/rate-limit-info';

describe('RateLimitInfo', () => {
  it('describes the account and its limits', () => {
    render(
      <RateLimitInfo
        accountName="Service Account"
        dailyLimit={1000}
        hourlyReadLimit={100}
      />
    );

    expect(screen.getByRole('heading', { name: 'title' })).toBeDefined();
    expect(screen.getByText('Service Account')).toBeDefined();
    expect(screen.getByText('readOnlyNote')).toBeDefined();
    expect(t).toHaveBeenCalledWith('requests', { count: 1000 });
    expect(t).toHaveBeenCalledWith('requests', { count: 100 });
  });
});
