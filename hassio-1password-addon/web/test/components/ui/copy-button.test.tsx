// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => import('../../helpers/next-intl'));

import { CopyButton } from '@/components/ui/copy-button';

const writeText = vi.fn();

const button = () => screen.getByRole('button', { name: 'Copy: the-text' });
const tooltip = () => button().parentElement?.getAttribute('data-tip');

describe('CopyButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset();
    vi.stubGlobal('navigator', { clipboard: { writeText } });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('copies the text, then flashes "copied" for 1.2s', async () => {
    writeText.mockResolvedValue(undefined);
    render(<CopyButton text="the-text" label="Copy" />);
    expect(tooltip()).toBe('Copy');

    await act(async () => fireEvent.click(button()));

    expect(writeText).toHaveBeenCalledWith('the-text');
    expect(tooltip()).toBe('copied');

    act(() => vi.advanceTimersByTime(1199));
    expect(tooltip()).toBe('copied');

    act(() => vi.advanceTimersByTime(1));
    expect(tooltip()).toBe('Copy');
  });

  it('stays on the copy state when the clipboard is unavailable', async () => {
    writeText.mockRejectedValue(new Error('insecure context'));
    render(<CopyButton text="the-text" label="Copy" />);

    await act(async () => fireEvent.click(button()));

    expect(tooltip()).toBe('Copy');
  });
});
