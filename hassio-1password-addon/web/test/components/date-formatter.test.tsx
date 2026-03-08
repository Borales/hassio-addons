// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useFormatter: () => ({
    relativeTime: vi.fn(() => '2 hours ago'),
    dateTime: vi.fn(() => 'Jan 1, 24')
  })
}));

import { CustomTimeAgo } from '@/components/date-formatter';

describe('CustomTimeAgo', () => {
  it('renders a <time> element with correct dateTime attribute (ISO string) for recent date', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    render(<CustomTimeAgo date={recentDate} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toBeDefined();
    expect(timeEl.getAttribute('dateTime')).toBe(recentDate.toISOString());
  });

  it('renders a <time> element with correct dateTime attribute (ISO string) for old date', () => {
    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    render(<CustomTimeAgo date={oldDate} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toBeDefined();
    expect(timeEl.getAttribute('dateTime')).toBe(oldDate.toISOString());
  });

  it('renders relative time for a date less than 7 days ago', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    render(<CustomTimeAgo date={recentDate} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl.textContent).toBe('2 hours ago');
  });

  it('sets title attribute with formatted date for a date less than 7 days ago', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    render(<CustomTimeAgo date={recentDate} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl.getAttribute('title')).toBe('Jan 1, 24');
  });

  it('renders absolute date for a date more than 7 days ago', () => {
    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    render(<CustomTimeAgo date={oldDate} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl.textContent).toBe('Jan 1, 24');
  });

  it('does NOT set title attribute for a date more than 7 days ago', () => {
    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    render(<CustomTimeAgo date={oldDate} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl.getAttribute('title')).toBeNull();
  });

  it('accepts a string date input', () => {
    const dateStr = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    render(<CustomTimeAgo date={dateStr} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toBeDefined();
    expect(timeEl.getAttribute('dateTime')).toBe(dateStr);
  });

  it('accepts a Date object input', () => {
    const dateObj = new Date(Date.now() - 2 * 60 * 60 * 1000);
    render(<CustomTimeAgo date={dateObj} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toBeDefined();
    expect(timeEl.getAttribute('dateTime')).toBe(dateObj.toISOString());
  });
});
