// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deferred } from '../../helpers/fixtures';

vi.mock('next-intl', () => import('../../helpers/next-intl'));
vi.mock('@/actions/refresh-ratelimits', () => ({
  refreshRateLimits: vi.fn()
}));

import { refreshRateLimits } from '@/actions/refresh-ratelimits';
import { RefreshButton } from '@/components/rate-limit/refresh-button';

const button = () =>
  screen.getByRole<HTMLButtonElement>('button', { name: 'refreshButton' });

describe('RefreshButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refreshes the rate limits on click', async () => {
    vi.mocked(refreshRateLimits).mockResolvedValue({ success: true } as never);
    render(<RefreshButton />);

    await act(async () => fireEvent.click(button()));

    expect(refreshRateLimits).toHaveBeenCalledOnce();
  });

  it('is locked while the refresh runs', async () => {
    const pending = deferred<never>();
    vi.mocked(refreshRateLimits).mockReturnValue(pending.promise);
    render(<RefreshButton />);

    await act(async () => fireEvent.click(button()));
    expect(button().disabled).toBe(true);

    await act(async () => pending.resolve({ success: true } as never));
    expect(button().disabled).toBe(false);
  });
});
