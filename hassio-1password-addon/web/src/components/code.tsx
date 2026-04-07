import { cn } from '@heroui/react';

export const Code = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <code
      className={cn(
        'bg-default-foreground/8 rounded-sm px-2 py-1.5 font-mono text-sm',
        className
      )}
    >
      {children}
    </code>
  );
};
