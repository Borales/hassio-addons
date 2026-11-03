// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../../helpers/next-intl';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import { BrokenBanner } from '@/components/ha-secret/broken-banner';

describe('BrokenBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('alerts with the count and renders the tags in its body', () => {
    render(<BrokenBanner count={3} />);

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'banner' })).toBeDefined();
    expect(t).toHaveBeenCalledWith('banner', { count: 3 });
    expect(screen.getByText('bannerBody')).toBeDefined();
    expect(screen.getByText('wide')).toBeDefined();
    expect(screen.getByText('code')).toBeDefined();
  });

  it('offers to show the broken secrets', () => {
    const onShow = vi.fn();
    render(<BrokenBanner count={3} onShow={onShow} />);

    fireEvent.click(screen.getByRole('button', { name: 'show' }));

    expect(onShow).toHaveBeenCalledOnce();
  });

  it('has no button while the filter is already active', () => {
    render(<BrokenBanner count={3} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
