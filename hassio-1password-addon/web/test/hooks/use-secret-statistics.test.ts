// @vitest-environment happy-dom
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSecretStatistics } from '@/hooks/use-secret-statistics';

describe('useSecretStatistics', () => {
  it('returns zeros for empty array', () => {
    const { result } = renderHook(() => useSecretStatistics([]));
    expect(result.current).toEqual({
      total: 0,
      assigned: 0,
      unassigned: 0,
      skipped: 0
    });
  });

  it('counts total as the full length of items', () => {
    const items = [{ itemId: '1' }, { itemId: null }, { itemId: null }];
    const { result } = renderHook(() => useSecretStatistics(items));
    expect(result.current.total).toBe(3);
  });

  it('counts assigned items (has itemId and not skipped)', () => {
    const items = [
      { itemId: 'op-item-1', isSkipped: false },
      { itemId: 'op-item-2', isSkipped: false },
      { itemId: null, isSkipped: false }
    ];
    const { result } = renderHook(() => useSecretStatistics(items));
    expect(result.current.assigned).toBe(2);
  });

  it('counts unassigned items (no itemId and not skipped)', () => {
    const items = [
      { itemId: null, isSkipped: false },
      { itemId: null, isSkipped: false },
      { itemId: 'op-item-1', isSkipped: false }
    ];
    const { result } = renderHook(() => useSecretStatistics(items));
    expect(result.current.unassigned).toBe(2);
  });

  it('counts skipped items regardless of itemId', () => {
    const items = [
      { itemId: null, isSkipped: true },
      { itemId: 'op-item-1', isSkipped: true },
      { itemId: null, isSkipped: false }
    ];
    const { result } = renderHook(() => useSecretStatistics(items));
    expect(result.current.skipped).toBe(2);
  });

  it('does not count skipped items as assigned', () => {
    const items = [{ itemId: 'op-item-1', isSkipped: true }];
    const { result } = renderHook(() => useSecretStatistics(items));
    expect(result.current.assigned).toBe(0);
    expect(result.current.skipped).toBe(1);
  });

  it('does not count skipped items as unassigned', () => {
    const items = [{ itemId: null, isSkipped: true }];
    const { result } = renderHook(() => useSecretStatistics(items));
    expect(result.current.unassigned).toBe(0);
    expect(result.current.skipped).toBe(1);
  });

  it('handles null isSkipped values', () => {
    const items = [{ itemId: null, isSkipped: null }];
    const { result } = renderHook(() => useSecretStatistics(items));
    expect(result.current).toEqual({
      total: 1,
      assigned: 0,
      unassigned: 1,
      skipped: 0
    });
  });

  it('handles a mixed set of items correctly', () => {
    const items = [
      { itemId: 'op-1', isSkipped: false }, // assigned
      { itemId: 'op-2', isSkipped: false }, // assigned
      { itemId: null, isSkipped: false }, // unassigned
      { itemId: null, isSkipped: true }, // skipped (no item)
      { itemId: 'op-3', isSkipped: true } // skipped (has item)
    ];
    const { result } = renderHook(() => useSecretStatistics(items));
    expect(result.current).toEqual({
      total: 5,
      assigned: 2,
      unassigned: 1,
      skipped: 2
    });
  });

  it('works with extra fields on items', () => {
    const items = [
      { itemId: 'op-1', isSkipped: false, id: 'secret-1', reference: 'op://v/i/f' }
    ];
    const { result } = renderHook(() => useSecretStatistics(items));
    expect(result.current.assigned).toBe(1);
  });
});
