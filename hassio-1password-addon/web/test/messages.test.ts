import { locales } from '@/config/locales';
import { IntlMessageFormat } from 'intl-messageformat';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Messages = { [key: string]: string | Messages };

const load = (locale: string): Messages =>
  JSON.parse(
    readFileSync(resolve(__dirname, `../messages/${locale}.json`), 'utf8')
  );

const flatten = (tree: Messages, prefix = ''): Record<string, string> =>
  Object.entries(tree).reduce<Record<string, string>>(
    (result, [key, value]) =>
      typeof value === 'string'
        ? { ...result, [`${prefix}${key}`]: value }
        : { ...result, ...flatten(value, `${prefix}${key}.`) },
    {}
  );

type AstNode = {
  type: number;
  value?: string;
  children?: AstNode[];
  options?: Record<string, { value: AstNode[] }>;
};

// Values the code has to pass: arguments (literals have type 0) and rich-text tags
const placeholders = (nodes: AstNode[]): string[] =>
  nodes.flatMap(({ type, value, children = [], options = {} }) => [
    ...(type !== 0 && type !== 7 && value ? [value] : []),
    ...placeholders(children),
    ...Object.values(options).flatMap((option) => placeholders(option.value))
  ]);

const placeholdersOf = (message: string, locale: string) =>
  [
    ...new Set(
      placeholders(new IntlMessageFormat(message, locale).getAst() as AstNode[])
    )
  ].sort();

const reference = flatten(load('en-us'));

describe.each(locales)('messages/%s.json', (locale) => {
  const messages = flatten(load(locale));

  it('has the same keys as en-us', () => {
    expect(Object.keys(messages).sort()).toEqual(Object.keys(reference).sort());
  });

  it('has only valid ICU messages', () => {
    for (const [key, message] of Object.entries(messages)) {
      expect(
        () => new IntlMessageFormat(message, locale),
        `${key}: ${message}`
      ).not.toThrow();
    }
  });

  it('uses the same arguments and tags as en-us', () => {
    for (const [key, message] of Object.entries(messages)) {
      expect(placeholdersOf(message, locale), `${key}: ${message}`).toEqual(
        placeholdersOf(reference[key] ?? '', 'en-us')
      );
    }
  });
});
