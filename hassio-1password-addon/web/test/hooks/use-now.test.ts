// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNow } from '@/hooks/use-now';

const START = new Date('2026-01-01T00:00:00.000Z').getTime();

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is null on the server and during hydration', () => {
    const Probe = () => String(useNow());
    expect(renderToString(createElement(Probe))).toBe('null');
  });

  it('returns the current time in the browser, rounded to the interval', () => {
    vi.setSystemTime(START + 1500);
    const { result } = renderHook(() => useNow(1000));
    expect(result.current).toBe(START + 1000);
  });

  it('ticks once per interval', () => {
    const { result } = renderHook(() => useNow(60_000));

    act(() => vi.advanceTimersByTime(59_999));
    expect(result.current).toBe(START);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(START + 60_000);
  });

  it('stops ticking on unmount', () => {
    const { unmount } = renderHook(() => useNow());
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
