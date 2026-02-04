import { Chip, Tooltip } from '@heroui/react';
import { ReactNode } from 'react';

interface ChipItem {
  id: string;
  label: string;
}

interface ChipListProps {
  items: ChipItem[];
  maxVisible?: number;
  emptyMessage?: string;
  chipClassName?: string;
  overflowChipClassName?: string;
  renderChip?: (item: ChipItem) => ReactNode;
}

export const ChipList = ({
  items,
  maxVisible = 4,
  emptyMessage = 'No items',
  chipClassName = 'h-5 bg-default-100 dark:bg-default-200',
  overflowChipClassName = 'h-5 bg-default-200 dark:bg-default-300',
  renderChip
}: ChipListProps) => {
  if (items.length === 0) {
    return (
      <span className="text-default-300 dark:text-default-500 text-sm italic">
        {emptyMessage}
      </span>
    );
  }

  const visibleItems = items.slice(0, maxVisible);
  const remainingItems = items.slice(maxVisible);
  const hasOverflow = remainingItems.length > 0;

  const defaultChipRenderer = (item: ChipItem) => (
    <Chip
      key={item.id}
      size="sm"
      variant="flat"
      classNames={{
        base: chipClassName,
        content: 'text-[10px] font-medium text-default-600 px-1.5'
      }}
    >
      {item.label}
    </Chip>
  );

  const chipRenderer = renderChip || defaultChipRenderer;

  return (
    <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
      {visibleItems.map(chipRenderer)}
      {hasOverflow && (
        <Tooltip content={remainingItems.map((item) => item.label).join(', ')}>
          <Chip
            size="sm"
            variant="flat"
            classNames={{
              base: overflowChipClassName,
              content: 'text-[10px] font-medium text-default-600 px-1.5'
            }}
          >
            +{remainingItems.length}
          </Chip>
        </Tooltip>
      )}
    </div>
  );
};
