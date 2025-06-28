'use client';

import { HaSecret } from '@/service/secret.service';
import { Card, CardBody, Chip, Code, Tooltip } from '@heroui/react';
import { useSearchParams } from 'next/navigation';
import { tv } from 'tailwind-variants';
import { CustomTimeAgo } from '../date-formatter';
import { HASecretHideToggle } from './secret-hide-toggle';
import { HASecretItemEdit } from './secret-item-edit';

export type Item = Pick<
  HaSecret,
  'id' | 'isSkipped' | 'itemId' | 'updatedAt' | 'reference'
>;

type HASecretItemProps = {
  item: Item;
};

const variants = tv({
  slots: {
    title: '',
    subtitle: 'text-xs'
  },
  variants: {
    type: {
      unassigned: {
        title: '',
        subtitle: 'text-danger-700'
      },
      skipped: {
        title: '',
        subtitle: 'text-default-300'
      }
    }
  }
});

export const HASecretItem = ({ item }: HASecretItemProps) => {
  const searchParams = useSearchParams();
  const newParams = new URLSearchParams(searchParams.toString());
  newParams.delete('secretId');

  const variant = variants({
    type: item.isSkipped ? 'skipped' : !item.itemId ? 'unassigned' : undefined
  });

  const tooltipContent = item.isSkipped
    ? 'skipped'
    : !item.itemId
      ? 'unassigned'
      : undefined;

  const isAssigned = !!item.itemId && !item.isSkipped;

  return (
    <Card radius="sm" isHoverable>
      <CardBody>
        <div className="flex items-center justify-between">
          <Tooltip
            color="default"
            isDisabled={!tooltipContent}
            content={tooltipContent}
            placement="bottom-start"
            delay={750}
          >
            <Code
              radius="sm"
              color={
                item.isSkipped ? 'default' : isAssigned ? 'success' : 'primary'
              }
              className="inline-block w-fit font-bold"
              size="sm"
            >
              {item.id}
            </Code>
          </Tooltip>

          <div className="flex items-center gap-1">
            {!item.isSkipped && <HASecretItemEdit secretId={item.id} />}
            <HASecretHideToggle secretId={item.id} isSkipped={item.isSkipped} />
          </div>
        </div>

        <section>
          {item.reference && (
            <Chip
              color="default"
              size="sm"
              variant="bordered"
              classNames={{ content: 'font-mono text-xs' }}
              radius="sm"
            >
              {item.reference}
            </Chip>
          )}

          {!item.reference && (
            <p className="text-default-500 text-sm">Unassigned </p>
          )}
          <p className="text-default-400 text-xs">
            {!item.updatedAt && 'Not updated yet'}
            {item.updatedAt && (
              <>
                Updated at: <CustomTimeAgo date={item.updatedAt} />
              </>
            )}
          </p>
        </section>
      </CardBody>
    </Card>
  );
};
