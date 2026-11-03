import { Fragment, ReactNode } from 'react';
import { vi } from 'vitest';

type TagRenderer = (chunks: ReactNode) => ReactNode;

const isRenderer = (value: unknown): value is TagRenderer =>
  typeof value === 'function';

/**
 * The key, followed by what each tag renderer produces. Renderers receive the
 * plain values as their chunks, or the tag's name when there are none.
 */
const rich = (key: string, values: Record<string, unknown> = {}): ReactNode => {
  const entries = Object.entries(values);
  const chunks = entries
    .filter(([, value]) => !isRenderer(value))
    .map(([, value]) => String(value))
    .join(' ');

  return (
    <>
      {key}
      {entries.map(
        ([tag, value]) =>
          isRenderer(value) && (
            <Fragment key={tag}>{value(chunks || tag)}</Fragment>
          )
      )}
    </>
  );
};

/** Returns keys, not copy. Spy on it to assert the interpolated values. */
export const t = Object.assign(
  vi.fn((key: string, _values?: Record<string, unknown>) => key),
  { rich: vi.fn(rich) }
);

export const locale = vi.fn(() => 'en-us');

/**
 * Stands in for the whole `next-intl` module:
 * vi.mock('next-intl', () => import('../helpers/next-intl'));
 */
export const useTranslations = () => t;
export const useLocale = () => locale();
export const useFormatter = () => ({
  number: (value: number) => String(value),
  dateTime: () => 'formatted-date',
  relativeTime: () => 'relative-time'
});
