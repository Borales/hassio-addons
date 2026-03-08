// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@heroui/react', () => ({
  Tooltip: ({
    children,
    content,
    placement,
    delay
  }: {
    children: React.ReactNode;
    content: string;
    placement?: string;
    delay?: number;
  }) => (
    <div
      data-testid="tooltip"
      data-content={content}
      data-placement={placement}
      data-delay={delay}
    >
      {children}
    </div>
  )
}));

import { StatusIndicator } from '@/components/ui/status-indicator';

describe('StatusIndicator', () => {
  it('renders a span inside a tooltip', () => {
    render(<StatusIndicator status="success" label="All good" />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toBeDefined();
    expect(tooltip.getAttribute('data-content')).toBe('All good');
  });

  it('passes the label as tooltip content', () => {
    render(<StatusIndicator status="warning" label="Warning state" />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip.getAttribute('data-content')).toBe('Warning state');
  });

  it('uses default placement of left', () => {
    render(<StatusIndicator status="inactive" label="Inactive" />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip.getAttribute('data-placement')).toBe('left');
  });

  it('accepts custom placement prop', () => {
    render(<StatusIndicator status="info" label="Info" placement="top" />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip.getAttribute('data-placement')).toBe('top');
  });

  it('uses default delay of 300', () => {
    render(<StatusIndicator status="danger" label="Danger" />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip.getAttribute('data-delay')).toBe('300');
  });

  it('accepts custom delay prop', () => {
    render(<StatusIndicator status="success" label="Success" delay={500} />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip.getAttribute('data-delay')).toBe('500');
  });

  it('renders success status with correct CSS class', () => {
    const { container } = render(
      <StatusIndicator status="success" label="Success" />
    );

    const span = container.querySelector('span');
    expect(span?.className).toContain('bg-success-500');
  });

  it('renders warning status with correct CSS class', () => {
    const { container } = render(
      <StatusIndicator status="warning" label="Warning" />
    );

    const span = container.querySelector('span');
    expect(span?.className).toContain('bg-warning-500');
  });

  it('renders inactive status with correct CSS class', () => {
    const { container } = render(
      <StatusIndicator status="inactive" label="Inactive" />
    );

    const span = container.querySelector('span');
    expect(span?.className).toContain('bg-default-300');
  });

  it('renders danger status with correct CSS class', () => {
    const { container } = render(
      <StatusIndicator status="danger" label="Danger" />
    );

    const span = container.querySelector('span');
    expect(span?.className).toContain('bg-danger-500');
  });

  it('renders info status with correct CSS class', () => {
    const { container } = render(
      <StatusIndicator status="info" label="Info" />
    );

    const span = container.querySelector('span');
    expect(span?.className).toContain('bg-blue-500');
  });

  it('applies custom className to the indicator span', () => {
    const { container } = render(
      <StatusIndicator
        status="success"
        label="Success"
        className="extra-class"
      />
    );

    const span = container.querySelector('span');
    expect(span?.className).toContain('extra-class');
  });
});
