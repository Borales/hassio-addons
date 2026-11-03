import type { ItemReference } from '@/lib/secret-status';
import { LockSimpleIcon, TextTIcon } from '@phosphor-icons/react/dist/ssr';

type ItemRefProps = {
  reference: ItemReference;
  /** On narrow screens the reference wraps instead of truncating. */
  wrap?: boolean;
  /** The link no longer resolves: strike the missing part. */
  stale?: 'item' | 'field' | null;
  fieldAriaLabel: string;
};

/**
 * A 1Password link shown item-first: "Smart Home · Mi Home [password]".
 * The field is an attribute of the entry, so it is drawn as a token with its
 * type icon (lock = concealed, T = text) rather than as a path segment.
 */
export const ItemRef = ({
  reference,
  wrap = false,
  stale = null,
  fieldAriaLabel
}: ItemRefProps) => {
  const { vault, item, fieldLabel, fieldType } = reference;
  const FieldIcon =
    !fieldType || stale
      ? null
      : fieldType === 'CONCEALED'
        ? LockSimpleIcon
        : TextTIcon;

  return (
    <span
      className={`iref ${wrap ? 'iref-wrap' : ''} ${stale ? `iref-stale-${stale}` : ''}`}
      title={`${vault} · ${item} · ${fieldLabel}`}
    >
      <span className="r-vault">{vault}</span>
      <span className="r-dot" aria-hidden="true">
        ·
      </span>
      <span className="r-item">{item}</span>
      <span className="r-field" aria-label={fieldAriaLabel}>
        {FieldIcon && <FieldIcon size={11} aria-hidden="true" />}
        {fieldLabel}
      </span>
    </span>
  );
};
