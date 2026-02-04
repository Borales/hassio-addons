'use client';

import { Fragment } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const statItemStyles = tv({
  slots: {
    base: 'text-default-500',
    value: 'text-foreground font-medium'
  },
  variants: {
    color: {
      default: {
        base: 'text-default-500'
      },
      success: {
        base: 'text-success-600 dark:text-success-400'
      },
      warning: {
        base: 'text-warning-600 dark:text-warning-400'
      },
      muted: {
        base: 'text-default-400'
      }
    }
  },
  defaultVariants: {
    color: 'default'
  }
});

type StatItemVariants = VariantProps<typeof statItemStyles>;

interface StatItemProps extends StatItemVariants {
  label: string;
  value: number;
}

const StatItem = ({ label, value, color }: StatItemProps) => {
  const { base, value: valueClass } = statItemStyles({ color });
  return (
    <span className={base()}>
      <span className={valueClass()}>{value}</span> {label}
    </span>
  );
};

interface StatisticsBarProps {
  stats: Array<{
    label: string;
    value: number;
    color?: StatItemVariants['color'];
    showWhenZero?: boolean;
  }>;
  className?: string;
}

export const StatisticsBar = ({ stats, className }: StatisticsBarProps) => {
  const visibleStats = stats.filter(
    (stat) => stat.showWhenZero || stat.value > 0
  );

  return (
    <div className={`mb-4 flex items-center gap-4 text-sm ${className || ''}`}>
      {visibleStats.map((stat, index) => (
        <Fragment key={stat.label}>
          {index > 0 && <span className="text-default-300">•</span>}
          <StatItem label={stat.label} value={stat.value} color={stat.color} />
        </Fragment>
      ))}
    </div>
  );
};
