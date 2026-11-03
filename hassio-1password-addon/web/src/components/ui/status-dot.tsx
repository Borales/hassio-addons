import type { SecretStatus } from '@/lib/secret-status';

type StatusDotProps = {
  status: SecretStatus;
  /** Without a label the dot is decorative (the status is named next to it). */
  label?: string;
};

export const StatusDot = ({ status, label }: StatusDotProps) => (
  <span
    className={`dot dot-${status}`}
    {...(label
      ? { role: 'img', 'aria-label': label, title: label }
      : { 'aria-hidden': true })}
  />
);
