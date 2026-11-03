import type { Icon } from '@phosphor-icons/react';
import { ReactNode } from 'react';

type EmptyStateProps = {
  icon: Icon;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
};

export const EmptyState = ({
  icon: IconComponent,
  title,
  children,
  action
}: EmptyStateProps) => (
  <div className="rounded-box hairline fade-in border border-dashed px-6 py-14 text-center">
    <div className="bg-base-content/5 text-muted mb-3 inline-flex size-11 items-center justify-center rounded-xl">
      <IconComponent size={20} />
    </div>
    <div className="text-[15px] font-medium">{title}</div>
    {children && (
      <div className="text-muted mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed">
        {children}
      </div>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
