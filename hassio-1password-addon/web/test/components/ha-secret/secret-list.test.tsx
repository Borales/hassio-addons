// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => key
}));

vi.mock('@/hooks/use-secret-statistics', () => ({
  useSecretStatistics: vi.fn((items: unknown[]) => ({
    total: items.length,
    assigned: 0,
    unassigned: items.length,
    skipped: 0
  }))
}));

vi.mock('@/components/ui/statistics-bar', () => ({
  StatisticsBar: ({
    stats
  }: {
    stats: Array<{ label: string; value: number }>;
  }) => (
    <div data-testid="statistics-bar">
      {stats.map((s) => (
        <span key={s.label} data-testid={`stat-${s.label}`}>
          {s.value}
        </span>
      ))}
    </div>
  )
}));

vi.mock('@/components/ui/status-indicator', () => ({
  StatusIndicator: ({ status, label }: { status: string; label: string }) => (
    <span
      data-testid="status-indicator"
      data-status={status}
      data-label={label}
    />
  )
}));

vi.mock('@/components/ui/chip-list', () => ({
  ChipList: ({ items }: { items: Array<{ id: string; label: string }> }) => (
    <div data-testid="chip-list" data-count={items.length} />
  )
}));

vi.mock('@/components/ui/action-buttons', () => ({
  ActionButtons: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="action-buttons">{children}</div>
  )
}));

vi.mock('@/components/date-formatter', () => ({
  CustomTimeAgo: ({ date }: { date: Date | string }) => (
    <time data-testid="time-ago">{String(date)}</time>
  )
}));

vi.mock('@/components/ha-secret/secret-hide-toggle', () => ({
  HASecretHideToggle: ({ secretId }: { secretId: string }) => (
    <button data-testid="hide-toggle" data-secret-id={secretId} />
  )
}));

vi.mock('@/components/ha-secret/secret-item-edit', () => ({
  HASecretItemEdit: ({ secret }: { secret: { id: string } }) => (
    <button data-testid="item-edit" data-secret-id={secret.id} />
  )
}));

vi.mock('@/components/ha-secret/secret-unassign', () => ({
  HASecretUnassign: ({ secretId }: { secretId: string }) => (
    <button data-testid="secret-unassign" data-secret-id={secretId} />
  )
}));

vi.mock('@heroui/react', () => ({
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
      {['secretKey', 'reference', 'lastUpdated', 'actions'].map((key) => (
        <React.Fragment key={key}>{children(key)}</React.Fragment>
      ))}
    </tr>
  ),
  TableCell: ({ children }: { children: React.ReactNode }) => (
    <td>{children}</td>
  )
}));

import { HASecretList } from '@/components/ha-secret/secret-list';

type Item = {
  id: string;
  isSkipped: boolean | null;
  itemId: string | null;
  updatedAt: Date | null;
  reference: string | null;
  groups?: Array<{ id: string; name: string }>;
};

const makeItem = (overrides: Partial<Item> = {}): Item => ({
  id: 'my_secret',
  isSkipped: false,
  itemId: null,
  updatedAt: null,
  reference: null,
  groups: [],
  ...overrides
});

describe('HASecretList', () => {
  it('renders the statistics bar', () => {
    render(<HASecretList items={[]} />);
    expect(screen.getByTestId('statistics-bar')).toBeDefined();
  });

  it('renders column headers', () => {
    render(<HASecretList items={[]} />);
    expect(screen.getByText('columns.secretKey')).toBeDefined();
    expect(screen.getByText('columns.reference')).toBeDefined();
    expect(screen.getByText('columns.lastUpdated')).toBeDefined();
    expect(screen.getByText('columns.actions')).toBeDefined();
  });

  it('renders a row for each item', () => {
    const items = [makeItem({ id: 'secret_a' }), makeItem({ id: 'secret_b' })];
    render(<HASecretList items={items} />);
    expect(screen.getByText('secret_a')).toBeDefined();
    expect(screen.getByText('secret_b')).toBeDefined();
  });

  it('renders status indicator for each item', () => {
    const items = [makeItem()];
    render(<HASecretList items={items} />);
    expect(screen.getByTestId('status-indicator')).toBeDefined();
  });

  it('renders "warning" status for unassigned item', () => {
    const items = [makeItem({ itemId: null, isSkipped: false })];
    render(<HASecretList items={items} />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator.getAttribute('data-status')).toBe('warning');
  });

  it('renders "success" status for assigned item', () => {
    const items = [makeItem({ itemId: 'op-item-1', isSkipped: false })];
    render(<HASecretList items={items} />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator.getAttribute('data-status')).toBe('success');
  });

  it('renders "inactive" status for skipped item', () => {
    const items = [makeItem({ isSkipped: true })];
    render(<HASecretList items={items} />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator.getAttribute('data-status')).toBe('inactive');
  });

  it('renders reference code when item has reference', () => {
    const items = [makeItem({ reference: 'op://vault/item/field' })];
    render(<HASecretList items={items} />);
    expect(screen.getByTestId('code')).toBeDefined();
    expect(screen.getByText('op://vault/item/field')).toBeDefined();
  });

  it('renders "notLinked" text when item has no reference', () => {
    const items = [makeItem({ reference: null })];
    render(<HASecretList items={items} />);
    expect(screen.getByText('notLinked')).toBeDefined();
  });

  it('renders CustomTimeAgo when item has updatedAt date', () => {
    const items = [makeItem({ updatedAt: new Date('2024-01-01') })];
    render(<HASecretList items={items} />);
    expect(screen.getByTestId('time-ago')).toBeDefined();
  });

  it('renders dash when item has no updatedAt', () => {
    const items = [makeItem({ updatedAt: null })];
    render(<HASecretList items={items} />);
    expect(screen.getByText('—')).toBeDefined();
  });

  it('renders action buttons for each item', () => {
    const items = [makeItem()];
    render(<HASecretList items={items} />);
    expect(screen.getByTestId('hide-toggle')).toBeDefined();
    expect(screen.getByTestId('item-edit')).toBeDefined();
    expect(screen.getByTestId('secret-unassign')).toBeDefined();
  });

  it('renders group chips when item has groups', () => {
    const items = [
      makeItem({
        groups: [
          { id: 'g1', name: 'group-a' },
          { id: 'g2', name: 'group-b' }
        ]
      })
    ];
    render(<HASecretList items={items} />);
    const chipList = screen.getByTestId('chip-list');
    expect(chipList.getAttribute('data-count')).toBe('2');
  });

  it('does not render chip list when item has no groups', () => {
    const items = [makeItem({ groups: [] })];
    render(<HASecretList items={items} />);
    expect(screen.queryByTestId('chip-list')).toBeNull();
  });

  it('passes correct total to statistics bar', () => {
    const items = [makeItem(), makeItem({ id: 'secret_2' })];
    render(<HASecretList items={items} />);
    const totalStat = screen.getByTestId('stat-statistics.total');
    expect(totalStat.textContent).toBe('2');
  });
});
