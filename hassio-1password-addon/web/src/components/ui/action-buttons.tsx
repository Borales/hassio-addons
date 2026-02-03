import { ReactNode } from 'react';

interface ActionButtonsProps {
  children: ReactNode;
  className?: string;
}

export const ActionButtons = ({ children, className }: ActionButtonsProps) => {
  return (
    <div className={`flex items-center justify-end gap-1 ${className || ''}`}>
      {children}
    </div>
  );
};
