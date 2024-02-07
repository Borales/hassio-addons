'use client';

import { Avatar, Link } from '@nextui-org/react';
import { GithubLogo } from '@phosphor-icons/react/dist/ssr';

export const Footer = () => {
  return (
    <footer className="text-center">
      <Link
        href="https://github.com/Borales/hassio-1password-addon"
        target="_blank"
      >
        <Avatar
          size="md"
          title="Visit the project on GitHub"
          className="bg-primary-900 text-default-100"
          icon={<GithubLogo size={32} weight="fill" />}
        />
      </Link>
    </footer>
  );
};
