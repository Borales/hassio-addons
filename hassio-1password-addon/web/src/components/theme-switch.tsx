'use client';

import { SwitchProps, useSwitch } from '@heroui/switch';
import { MoonIcon, SunIcon } from '@phosphor-icons/react/dist/ssr';
import { useIsSSR } from '@react-aria/ssr';
import { VisuallyHidden } from '@react-aria/visually-hidden';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { FC } from 'react';
import { tv } from 'tailwind-variants';

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps['classNames'];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames
}) => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();
  const t = useTranslations('theme');

  const onChange = () => {
    theme === 'light' ? setTheme('dark') : setTheme('light');
  };

  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps
  } = useSwitch({
    isSelected: theme === 'light' || isSSR,
    'aria-label':
      theme === 'light' || isSSR ? t('switchToDark') : t('switchToLight'),
    onChange
  });

  const baseStyles = tv({
    base: 'cursor-pointer px-px transition-opacity hover:opacity-80'
  });

  const wrapperStyles = tv({
    base: [
      'h-auto w-auto',
      'bg-transparent',
      'rounded-lg',
      'flex items-center justify-center',
      'group-data-[selected=true]:bg-transparent',
      'text-default-500!',
      'pt-px',
      'px-0',
      'mx-0'
    ]
  });

  return (
    <Component
      {...getBaseProps({
        className: baseStyles({ className: [className, classNames?.base] })
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: wrapperStyles({ className: classNames?.wrapper })
        })}
      >
        {!isSelected || isSSR ? <SunIcon size={22} /> : <MoonIcon size={22} />}
      </div>
    </Component>
  );
};
