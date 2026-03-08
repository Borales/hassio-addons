// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@heroui/react', () => ({
  Image: ({
    src,
    alt,
    width,
    height,
    fallbackSrc,
    radius,
    loading
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fallbackSrc?: string;
    radius?: string;
    loading?: string;
  }) => (
    <img
      data-testid="op-icon"
      src={src}
      alt={alt}
      width={width}
      height={height}
      data-fallback={fallbackSrc}
      data-radius={radius}
      data-loading={loading}
    />
  )
}));

import { OpSecretIcon } from '@/components/op-secret/secret-icon';

describe('OpSecretIcon', () => {
  it('renders fallback image when no URLs provided', () => {
    render(<OpSecretIcon urls={[]} alt="test" />);
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('src')).toBe('/op-item.png');
  });

  it('renders favicon URL for a valid external URL', () => {
    render(
      <OpSecretIcon
        urls={[{ href: 'https://github.com', primary: true }]}
        alt="GitHub"
      />
    );
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('src')).toBe(
      'https://c.1password.com/richicons/images/login/64/github.com.png'
    );
  });

  it('uses primary URL when available', () => {
    render(
      <OpSecretIcon
        urls={[
          { href: 'https://example.com', primary: false },
          { href: 'https://github.com', primary: true }
        ]}
        alt="test"
      />
    );
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('src')).toContain('github.com');
  });

  it('falls back to first URL when no primary URL', () => {
    render(
      <OpSecretIcon
        urls={[
          { href: 'https://example.com', primary: false },
          { href: 'https://github.com', primary: false }
        ]}
        alt="test"
      />
    );
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('src')).toContain('example.com');
  });

  it('uses fallback for localhost URLs', () => {
    render(
      <OpSecretIcon
        urls={[{ href: 'http://localhost:3000', primary: true }]}
        alt="local"
      />
    );
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('src')).toBe('/op-item.png');
  });

  it('uses fallback for .local domain URLs', () => {
    render(
      <OpSecretIcon
        urls={[{ href: 'http://homeassistant.local', primary: true }]}
        alt="local"
      />
    );
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('src')).toBe('/op-item.png');
  });

  it('prepends https:// when URL does not start with http', () => {
    render(
      <OpSecretIcon
        urls={[{ href: 'github.com', primary: true }]}
        alt="GitHub"
      />
    );
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('src')).toContain('github.com');
    expect(img.getAttribute('src')).not.toBe('/op-item.png');
  });

  it('renders with default size of 32', () => {
    render(<OpSecretIcon urls={[]} alt="test" />);
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('width')).toBe('32');
    expect(img.getAttribute('height')).toBe('32');
  });

  it('renders with size 64 when specified', () => {
    render(<OpSecretIcon urls={[]} alt="test" size={64} />);
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('width')).toBe('64');
    expect(img.getAttribute('height')).toBe('64');
  });

  it('passes alt text to the image', () => {
    render(<OpSecretIcon urls={[]} alt="My Secret" />);
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('alt')).toBe('My Secret');
  });

  it('sets fallbackSrc to /op-item.png', () => {
    render(
      <OpSecretIcon
        urls={[{ href: 'https://github.com', primary: true }]}
        alt="test"
      />
    );
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('data-fallback')).toBe('/op-item.png');
  });

  it('uses lazy loading', () => {
    render(<OpSecretIcon urls={[]} alt="test" />);
    const img = screen.getByTestId('op-icon');
    expect(img.getAttribute('data-loading')).toBe('lazy');
  });
});
