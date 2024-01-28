import { Image, ImageProps } from '@nextui-org/react';

const hostnameToSkip = ['localhost', '.local'];

type OpSecretIconProps = {
  size?: 32 | 64;
  urls: { primary: boolean; href: string }[];
} & Pick<ImageProps, 'alt'>;

export const OpSecretIcon = ({
  size = 32,
  urls,
  ...rest
}: OpSecretIconProps) => {
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
      classNames={{ wrapper: 'bg-contain' }}
      radius="sm"
      loading="lazy"
      width={size}
      height={size}
      src={secretSrc}
      fallbackSrc={fallbackSrc}
      {...rest}
    />
  );
};
