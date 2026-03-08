// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('@/actions/group-delete', () => ({
  deleteGroup: vi.fn()
}));

vi.mock('@/components/group/group-modal-provider', () => ({
  useGroupModal: vi.fn(() => ({
    openEditModal: vi.fn(),
    closeModal: vi.fn()
  }))
}));

vi.mock('@/components/ui/action-buttons', () => ({
  ActionButtons: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="action-buttons">{children}</div>
  )
}));

vi.mock('@/components/ui/chip-list', () => ({
  ChipList: ({
    items,
    emptyMessage
  }: {
    items: Array<{ id: string; label: string }>;
    emptyMessage?: string;
  }) => (
    <div data-testid="chip-list" data-count={items.length}>
      {items.length === 0 ? emptyMessage : items.map((i) => i.label).join(', ')}
    </div>
  )
}));

vi.mock('@/components/ui/confirm-dialog', () => ({
  ConfirmDialog: ({
    trigger,
    message
  }: {
    trigger: (onOpen: () => void) => React.ReactElement;
    message: string;
  }) => (
    <div data-testid="confirm-dialog" data-message={message}>
      {trigger(vi.fn())}
    </div>
  )
}));

vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    'aria-label': ariaLabel,
    onPress,
    onClick,
    isLoading,
    isIconOnly,
    color,
    size,
    variant
  }: {
    children?: React.ReactNode;
    'aria-label'?: string;
    onPress?: () => void;
    onClick?: () => void;
    isLoading?: boolean;
    isIconOnly?: boolean;
    color?: string;
    size?: string;
    variant?: string;
  }) => (
    <button
      aria-label={ariaLabel}
      onClick={onPress || onClick}
      data-loading={String(isLoading)}
      data-color={color}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Chip: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="chip">{children}</span>
  ),
  Code: ({ children }: { children: React.ReactNode }) => (
    <code data-testid="code">{children}</code>
  ),
  Table: ({
    children,
    'aria-label': ariaLabel
  }: {
    children: React.ReactNode;
    'aria-label'?: string;
  }) => <table aria-label={ariaLabel}>{children}</table>,
  TableHeader: ({
    children,
    columns
  }: {
    children: (col: { key: string; label: string }) => React.ReactElement;
    columns: Array<{ key: string; label: string }>;
  }) => (
    <thead>
      <tr>{columns.map(children)}</tr>
    </thead>
  ),
  TableColumn: ({ children }: { children: React.ReactNode }) => (
    <th>{children}</th>
  ),
  TableBody: ({
    children,
    items
  }: {
    children: (item: unknown) => React.ReactElement;
    items: unknown[];
  }) => <tbody>{items.map(children)}</tbody>,
  TableRow: ({
    children
  }: {
    children: (key: string) => React.ReactElement;
  }) => (
    <tr>
      {['name', 'secrets', 'event', 'actions'].map((key) => (
        <React.Fragment key={key}>{children(key)}</React.Fragment>
      ))}
    </tr>
  ),
  TableCell: ({ children }: { children: React.ReactNode }) => (
    <td>{children}</td>
  ),
  Tooltip: ({
    children,
    content
  }: {
    children: React.ReactNode;
    content: string;
  }) => (
    <div data-testid="tooltip" data-content={content}>
      {children}
    </div>
  )
}));

vi.mock('@phosphor-icons/react', () => ({
  PencilSimpleIcon: () => <svg data-testid="pencil-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />
}));

import { GroupList } from '@/components/group/group-list';

import type { GroupWithSecrets } from '@/service/group.service';

const makeGroup = (overrides: Record<string, unknown> = {}): GroupWithSecrets =>
  ({
    id: 'group-1',
    name: 'my-group',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    secrets: [],
    ...overrides
  }) as unknown as GroupWithSecrets;

describe('GroupList', () => {
  it('renders a table with column headers', () => {
    render(<GroupList groups={[]} />);
    expect(screen.getByText('name')).toBeDefined();
    expect(screen.getByText('secrets')).toBeDefined();
    expect(screen.getByText('event')).toBeDefined();
    expect(screen.getByText('actions')).toBeDefined();
  });

  it('renders a row for each group', () => {
    const groups = [
      makeGroup({ id: 'g1', name: 'alpha' }),
      makeGroup({ id: 'g2', name: 'beta' })
    ];
    render(<GroupList groups={groups} />);
    expect(screen.getByText('alpha')).toBeDefined();
    expect(screen.getByText('beta')).toBeDefined();
  });

  it('renders the event name code for each group', () => {
    const groups = [makeGroup({ name: 'my-group' })];
    render(<GroupList groups={groups} />);
    const codes = screen.getAllByTestId('code');
    const eventCode = codes.find((c) =>
      c.textContent?.includes('onepassword_group_my-group_updated')
    );
    expect(eventCode).toBeDefined();
  });

  it('renders ChipList for secrets column', () => {
    const groups = [
      makeGroup({
        secrets: [{ secretId: 'secret-1' }, { secretId: 'secret-2' }]
      })
    ];
    render(<GroupList groups={groups} />);
    const chipList = screen.getByTestId('chip-list');
    expect(chipList.getAttribute('data-count')).toBe('2');
  });

  it('renders empty ChipList when group has no secrets', () => {
    const groups = [makeGroup({ secrets: [] })];
    render(<GroupList groups={groups} />);
    const chipList = screen.getByTestId('chip-list');
    expect(chipList.getAttribute('data-count')).toBe('0');
    expect(chipList.textContent).toBe('noSecrets');
  });

  it('renders edit and delete action buttons', () => {
    const groups = [makeGroup()];
    render(<GroupList groups={groups} />);
    expect(screen.getByTestId('pencil-icon')).toBeDefined();
    expect(screen.getByTestId('trash-icon')).toBeDefined();
  });

  it('renders a tooltip with description when group has description', () => {
    const groups = [makeGroup({ description: 'My description' })];
    render(<GroupList groups={groups} />);
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip.getAttribute('data-content')).toBe('My description');
  });

  it('does not render tooltip when group has no description', () => {
    const groups = [makeGroup({ description: null })];
    render(<GroupList groups={groups} />);
    expect(screen.queryByTestId('tooltip')).toBeNull();
  });

  it('renders a ConfirmDialog for delete action', () => {
    const groups = [makeGroup()];
    render(<GroupList groups={groups} />);
    expect(screen.getByTestId('confirm-dialog')).toBeDefined();
  });
});
