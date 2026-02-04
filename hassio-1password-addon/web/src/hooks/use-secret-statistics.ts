import { useMemo } from 'react';

interface SecretStatistics {
  total: number;
  assigned: number;
  unassigned: number;
  skipped: number;
}

interface SecretItem {
  itemId?: string | null;
  isSkipped?: boolean | null;
}

export const useSecretStatistics = <T extends SecretItem>(
  items: T[]
): SecretStatistics => {
  return useMemo(() => {
    const assigned = items.filter(
      (item) => item.itemId && !item.isSkipped
    ).length;
    const unassigned = items.filter(
      (item) => !item.itemId && !item.isSkipped
    ).length;
    const skipped = items.filter((item) => item.isSkipped).length;

    return {
      total: items.length,
      assigned,
      unassigned,
      skipped
    };
  }, [items]);
};
