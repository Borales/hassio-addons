// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../../helpers/next-intl';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import { UsageCard } from '@/components/rate-limit/usage-card';

const NOW = new Date('2026-01-01T12:00:00.000Z').getTime();

const inMinutes = (minutes: number) =>
  new Date(NOW + minutes * 60_000).toISOString();

const card = (used: number, limit = 100, reset = inMinutes(90)) => (
  <UsageCard
    title="Daily"
    description="Per day"
    used={used}
    limit={limit}
    reset={reset}
  />
);

const progress = () => screen.getByRole<HTMLProgressElement>('progressbar');

describe('UsageCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the usage against the limit in a labelled section', () => {
    render(card(25));

    expect(screen.getByRole('region', { name: 'Daily' }).textContent).toContain(
      '25 / 100'
    );
    expect(screen.getByText('Per day')).toBeDefined();
    expect(t).toHaveBeenCalledWith('percentUsed', { percent: '25.0' });
    expect(t).toHaveBeenCalledWith('remaining', { count: 75 });
  });

  it('never reports a negative remaining count', () => {
    render(
      <UsageCard
        title="Daily"
        description="Per day"
        used={150}
        limit={100}
        reset=""
      />
    );

    expect(t).toHaveBeenCalledWith('remaining', { count: 0 });
  });

  describe('thresholds', () => {
    it.each([0, 50, 74])('stays calm at %i%%', (used) => {
      render(card(used));

      expect(progress().className).not.toContain('progress-warning');
      expect(progress().className).not.toContain('progress-error');
      expect(screen.queryByText('high')).toBeNull();
      expect(screen.queryByText('nearLimit')).toBeNull();
    });

    it.each([75, 89])('warns at %i%%', (used) => {
      render(card(used));

      expect(progress().className).toContain('progress-warning');
      expect(progress().className).not.toContain('progress-error');
      expect(screen.getByText('high')).toBeDefined();
      expect(screen.queryByText('nearLimit')).toBeNull();
    });

    it.each([90, 100])('is critical at %i%%', (used) => {
      render(card(used));

      expect(progress().className).toContain('progress-error');
      expect(progress().className).not.toContain('progress-warning');
      expect(screen.getByText('nearLimit')).toBeDefined();
      expect(screen.queryByText('high')).toBeNull();
    });
  });

  describe('progress', () => {
    it('reports the percentage', () => {
      render(card(25));

      expect(progress().value).toBe(25);
      expect(t).toHaveBeenCalledWith('progressLabel', {
        title: 'Daily',
        percentage: '25.0'
      });
    });

    it('caps at 100%', () => {
      render(card(150));
      expect(progress().value).toBe(100);
    });

    it('is empty when there is no limit', () => {
      render(card(5, 0));

      expect(progress().value).toBe(0);
      expect(progress().className).not.toContain('progress-error');
    });
  });

  describe('reset', () => {
    it('shows hours and minutes', () => {
      render(card(1, 100, inMinutes(90)));

      expect(screen.getByText('resetsInHours')).toBeDefined();
      expect(t).toHaveBeenCalledWith('resetsInHours', {
        hours: 1,
        minutes: 30
      });
    });

    it('shows minutes under an hour', () => {
      render(card(1, 100, inMinutes(30)));

      expect(screen.getByText('resetsInMinutes')).toBeDefined();
      expect(t).toHaveBeenCalledWith('resetsInMinutes', { minutes: 30 });
    });

    it('rounds up to one minute under a minute', () => {
      render(card(1, 100, inMinutes(0.5)));
      expect(t).toHaveBeenCalledWith('resetsInMinutes', { minutes: 1 });
    });

    it.each([
      ['no reset time', ''],
      ['a reset time in the past', inMinutes(-5)]
    ])('shows the no-reset text with %s', (_case, reset) => {
      render(card(1, 100, reset));
      expect(screen.getByText('noReset')).toBeDefined();
    });

    it('is left out of the server markup', () => {
      const html = renderToString(card(1));

      expect(html).not.toContain('resetsIn');
      expect(html).not.toContain('noReset');
    });
  });
});
