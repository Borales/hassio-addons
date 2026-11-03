// @vitest-environment happy-dom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JsonCode, YamlCode } from '@/components/ui/code';

const spanTexts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('span')).map(
    ({ textContent }) => textContent
  );

describe('JsonCode', () => {
  const data = { name: 'xiaomi', count: 2, ok: true, none: null };

  it('keeps the formatted JSON intact', () => {
    const { container } = render(<JsonCode data={data} />);
    expect(container.textContent).toBe(JSON.stringify(data, null, 2));
  });

  it('wraps keys and values, but not the colons, as separate tokens', () => {
    const { container } = render(<JsonCode data={data} />);
    expect(spanTexts(container)).toEqual([
      '"name"',
      '"xiaomi"',
      '"count"',
      '2',
      '"ok"',
      'true',
      '"none"',
      'null'
    ]);
  });
});

describe('YamlCode', () => {
  it('renders one line per source line, keeping blank lines', () => {
    const { container } = render(<YamlCode text={'a: 1\n\n# note'} />);
    const lines = Array.from(container.querySelectorAll('div')).map(
      ({ textContent }) => textContent
    );
    expect(lines).toEqual(['a: 1', ' ', '# note']);
  });

  it('splits a list item into its key and value', () => {
    const { container } = render(<YamlCode text={'  - platform: state'} />);

    expect(spanTexts(container)).toEqual(['platform', ' state']);
    expect(container.textContent).toBe('  - platform: state');
  });

  it('leaves lines without a key unhighlighted', () => {
    const { container } = render(<YamlCode text="# comment" />);
    expect(spanTexts(container)).toEqual([]);
  });
});
