'use client';

import { Avatar, Link } from '@heroui/react';
import { GithubLogoIcon } from '@phosphor-icons/react/dist/ssr';

export const Footer = () => {
  return (
    <footer className="text-center">
      <Link href="https://github.com/Borales/hassio-addons" target="_blank">
        <Avatar
          size="md"
          title="Visit the project on GitHub"
          className="bg-primary-900 text-default-100"
          icon={<GithubLogoIcon size={32} weight="fill" />}
        />
      </Link>
    </footer>
  );
};
