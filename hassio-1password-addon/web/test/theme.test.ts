import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/postcss';
import postcss, { AtRule, Rule } from 'postcss';
import { beforeAll, describe, expect, it } from 'vitest';

const GLOBALS = resolve(__dirname, '../src/app/globals.css');

describe('compiled theme', () => {
  let rules: Rule[] = [];

  beforeAll(async () => {
    const { root } = await postcss([tailwindcss()]).process(
      readFileSync(GLOBALS, 'utf8'),
      { from: GLOBALS }
    );

    root.walkRules((rule) => {
      // Colors are repeated under @supports as a modern-syntax fallback.
      const parent = rule.parent as AtRule | undefined;
      if (parent?.name !== 'supports') rules.push(rule);
    });
  }, 60_000);

  // A second definition can silently win through specificity, even if it comes
  // first: the page then renders in daisyUI's stock colors with no error at all.
  it.each(['dark', 'light'])('defines the %s theme only once', (theme) => {
    const definitions = rules.filter(
      (rule) =>
        new RegExp(`\\[data-theme="?${theme}"?\\]`).test(rule.selector) &&
        rule.nodes.some(
          (node) => node.type === 'decl' && node.prop === '--color-primary'
        )
    );

    expect(definitions).toHaveLength(1);
  });
});
