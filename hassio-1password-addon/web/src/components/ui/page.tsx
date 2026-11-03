import { ReactNode } from 'react';

export const PageContainer = ({ children }: { children: ReactNode }) => (
  <div className="fade-in mx-auto w-full max-w-7xl flex-1 px-4 pb-8 sm:px-8">
    {children}
  </div>
);

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

/** Title and description on the left, page actions on the right. */
export const PageHeader = ({
  title,
  description,
  actions
}: PageHeaderProps) => (
  <header className="pt-6 pb-5 sm:pt-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h1 className="text-[22px] leading-tight font-semibold tracking-tight sm:text-[26px]">
          {title}
        </h1>
        {description && (
          <p className="text-base-content/75 mt-1.5 max-w-2xl text-[13.5px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  </header>
);
