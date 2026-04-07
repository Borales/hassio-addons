import { Tooltip } from '@heroui/react';
import { tv } from 'tailwind-variants';

const statusIndicatorStyles = tv({
  base: 'h-2 w-2 shrink-0 rounded-full',
  variants: {
    status: {
      success: 'bg-success',
      warning: 'bg-warning',
      inactive: 'bg-default',
      info: 'bg-blue-500',
      danger: 'bg-danger'
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
  className?: string;
}

export const StatusIndicator = ({
  status,
  label,
  placement = 'left',
  className
}: StatusIndicatorProps) => {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <div className={statusIndicatorStyles({ status, className })} />
      </Tooltip.Trigger>
      <Tooltip.Content placement={placement}>{label}</Tooltip.Content>
    </Tooltip>
  );
};
