import { ReactNode } from 'react';

type ChipItem = {
  id: string;
  label: string;
  /** Rendered in front of the label, e.g. a status dot. */
  prefix?: ReactNode;
};

type ChipListProps = {
  items: ChipItem[];
  maxVisible?: number;
  /** Builds the overflow chip's text from the number of hidden items. */
  overflowLabel?: (count: number) => string;
  wrap?: boolean;
};

export const ChipList = ({
  items,
  maxVisible = 2,
  overflowLabel = (count) => `+${count}`,
  wrap = false
}: ChipListProps) => {
  if (items.length === 0) return null;

  const visible = items.slice(0, maxVisible);
  const hidden = items.slice(maxVisible);

  return (
    <span
      className={`items-center ${wrap ? 'flex flex-wrap gap-1.5' : 'inline-flex shrink-0 gap-1'}`}
    >
      {visible.map(({ id, label, prefix }) => (
        <span key={id} className="chip-tag" title={label}>
          {prefix}
          {label}
        </span>
      ))}
      {hidden.length > 0 && (
        <span
          className="tooltip"
          data-tip={hidden.map(({ label }) => label).join(', ')}
        >
          <span className="chip-tag">{overflowLabel(hidden.length)}</span>
        </span>
      )}
    </span>
  );
};
