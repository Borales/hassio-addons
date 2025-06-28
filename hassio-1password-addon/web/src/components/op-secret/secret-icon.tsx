import { Image, ImageProps } from '@heroui/react';

const hostnameToSkip = ['localhost', '.local'];

type OpSecretIconProps = {
  size?: 32 | 64;
  urls: { primary?: boolean | null; href: string }[];
} & Pick<ImageProps, 'alt'>;

export const OpSecretIcon = ({ size = 32, urls, alt }: OpSecretIconProps) => {
  const fallbackSrc = '/op-item.png';
  let secretSrc = fallbackSrc;

  if (urls.length > 0) {
    const primary = urls.find((url) => url.primary);
    let secretHref;
    if (primary) {
      secretHref = primary.href;
    } else {
      secretHref = urls[0].href;
    }

    if (!secretHref.startsWith('http')) {
      secretHref = `https://${secretHref}`;
    }

    const hostname = new URL(secretHref).hostname;
    const shouldBeIgnored = hostnameToSkip.find(
      (host) => hostname.includes(host) || hostname.endsWith(host)
    );

    if (!shouldBeIgnored) {
      secretSrc = `https://c.1password.com/richicons/images/login/64/${hostname}.png`;
    }
  }

  return (
    <Image
      alt={alt}
      classNames={{ wrapper: 'bg-contain' }}
      radius="sm"
      loading="lazy"
      width={size}
      height={size}
      src={secretSrc}
      fallbackSrc={fallbackSrc}
    />
  );
};
