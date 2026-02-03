import { Tooltip } from '@heroui/react';
import { tv } from 'tailwind-variants';

const statusIndicatorStyles = tv({
  base: 'h-2 w-2 shrink-0 rounded-full',
  variants: {
    status: {
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      inactive: 'bg-default-300',
      info: 'bg-blue-500',
      danger: 'bg-danger-500'
    }
  },
  defaultVariants: {
    status: 'inactive'
  }
});

type StatusIndicatorStatus =
  | 'success'
  | 'warning'
  | 'inactive'
  | 'info'
  | 'danger';

interface StatusIndicatorProps {
  status: StatusIndicatorStatus;
  label: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const StatusIndicator = ({
  status,
  label,
  placement = 'left',
  delay = 300,
  className
}: StatusIndicatorProps) => {
  return (
    <Tooltip content={label} placement={placement} delay={delay}>
      <span className={statusIndicatorStyles({ status, className })} />
    </Tooltip>
  );
};
