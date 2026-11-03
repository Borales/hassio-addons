// @vitest-environment happy-dom
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OpSecretIcon } from '@/components/op-secret/secret-icon';

// The local path comes back resolved against the test page's origin.
const FALLBACK = expect.stringMatching(/\/op-item\.png$/);
const richIcon = (hostname: string) =>
  `https://c.1password.com/richicons/images/login/64/${hostname}.png`;

const setup = (urls: { primary?: boolean; href: string }[], alt?: string) => {
  const { container } = render(<OpSecretIcon urls={urls} alt={alt} />);
  return container.querySelector('img') as HTMLImageElement;
};

describe('OpSecretIcon', () => {
  it('falls back to the generic icon without urls', () => {
    expect(setup([]).getAttribute('src')).toEqual(FALLBACK);
  });

  it('falls back to the generic icon when the url is not parseable', () => {
    expect(setup([{ href: 'my server' }]).getAttribute('src')).toEqual(
      FALLBACK
    );
  });

  it('prefers the primary url', () => {
    const img = setup([
      { href: 'https://other.com' },
      { primary: true, href: 'https://example.com/login' }
    ]);
    expect(img.getAttribute('src')).toBe(richIcon('example.com'));
  });

  it('uses the first url when none is primary', () => {
    const img = setup([
      { href: 'https://first.com' },
      { href: 'https://second.com' }
    ]);
    expect(img.getAttribute('src')).toBe(richIcon('first.com'));
  });

  it('accepts a url without a protocol', () => {
    expect(setup([{ href: 'example.com' }]).getAttribute('src')).toBe(
      richIcon('example.com')
    );
  });

  it.each(['http://localhost:8123', 'http://homeassistant.local:8123'])(
    'keeps the generic icon for the local address %s',
    (href) => {
      expect(setup([{ href }]).getAttribute('src')).toEqual(FALLBACK);
    }
  );

  it('switches to the generic icon when the rich icon fails to load', () => {
    const img = setup([{ href: 'https://example.com' }]);

    fireEvent.error(img);

    expect(img.getAttribute('src')).toEqual(FALLBACK);
  });

  it('is decorative unless given alt text', () => {
    expect(setup([]).getAttribute('alt')).toBe('');
    expect(setup([], 'Mi Home').getAttribute('alt')).toBe('Mi Home');
  });
});
