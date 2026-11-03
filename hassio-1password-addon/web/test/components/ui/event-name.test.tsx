// @vitest-environment happy-dom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EventName } from '@/components/ui/event-name';

describe('EventName', () => {
  it('emphasises the group part of a group event', () => {
    const { container } = render(
      <EventName name="onepassword_group_xiaomi_updated" />
    );

    expect(container.textContent).toBe('onepassword_group_xiaomi_updated');
    expect(container.querySelector('b')?.textContent).toBe('xiaomi');
  });

  it('italicises the {name} placeholder instead', () => {
    const { container } = render(
      <EventName name="onepassword_group_{name}_updated" />
    );

    expect(container.querySelector('i')?.textContent).toBe('{name}');
    expect(container.querySelector('b')).toBeNull();
  });

  it('emphasises what follows the prefix of any other event', () => {
    const { container } = render(
      <EventName name="onepassword_secret_assigned" />
    );

    expect(container.textContent).toBe('onepassword_secret_assigned');
    expect(container.querySelector('b')?.textContent).toBe('secret_assigned');
  });

  it('adds the prefix when the name lacks it', () => {
    const { container } = render(<EventName name="secret_assigned" />);
    expect(container.textContent).toBe('onepassword_secret_assigned');
  });

  it('passes the class name through', () => {
    const { container } = render(<EventName name="x" className="truncate" />);
    expect(container.querySelector('.truncate')).not.toBeNull();
  });
});
