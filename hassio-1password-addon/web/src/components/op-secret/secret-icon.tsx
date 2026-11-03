'use client';

import Image from 'next/image';
import { useState } from 'react';

const hostnameToSkip = ['localhost', '.local'];

// 1Password URL fields are free text, so a value may not parse as a URL.
const getHostname = (href: string) => {
  try {
    return new URL(href.startsWith('http') ? href : `https://${href}`).hostname;
  } catch {
    return null;
  }
};

type OpSecretIconProps = {
  size?: number;
  urls: { primary?: boolean | null; href: string }[];
  alt?: string;
};

export const OpSecretIcon = ({ size = 32, urls, alt }: OpSecretIconProps) => {
  // Relative: the app is served from a Home Assistant ingress sub-path.
  const fallbackSrc = './op-item.png';
  let secretSrc = fallbackSrc;

  if (urls.length > 0) {
    const primary = urls.find((url) => url.primary);
    const hostname = getHostname((primary ?? urls[0]).href);
    const shouldBeIgnored =
      !hostname ||
      hostnameToSkip.find(
        (host) => hostname.includes(host) || hostname.endsWith(host)
      );

    if (!shouldBeIgnored) {
      secretSrc = `https://c.1password.com/richicons/images/login/64/${hostname}.png`;
    }
  }

  const [src, setSrc] = useState(secretSrc);

  return (
    <Image
      alt={alt || ''}
      className="bg-base-100 shrink-0 rounded-md object-contain shadow-[0_0_0_1px_var(--hairline)]"
      loading="lazy"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      src={src}
      onError={() => setSrc(fallbackSrc)}
      unoptimized
    />
  );
};
