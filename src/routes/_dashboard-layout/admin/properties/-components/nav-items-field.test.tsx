import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { render } from '@/test-utils';

import { NavItemsField } from './nav-items-field';

test('a group checkbox is indeterminate when only some of its items are shown', () => {
  render(<NavItemsField disabled={['rooms']} onChange={vi.fn()} />);

  expect(
    screen.getByRole('checkbox', { name: 'Front Office' })
  ).toHaveAttribute('aria-checked', 'mixed');
  expect(screen.getByRole('checkbox', { name: 'Integrations' })).toBeChecked();
});

test('a group checkbox switches its whole group on and off', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { rerender } = render(
    <NavItemsField disabled={['rooms', 'users']} onChange={onChange} />
  );

  // Partly shown: a click shows the rest, leaving other groups alone.
  await user.click(screen.getByRole('checkbox', { name: 'Front Office' }));
  expect(onChange).toHaveBeenLastCalledWith(['users']);

  rerender(<NavItemsField disabled={['users']} onChange={onChange} />);
  await user.click(screen.getByRole('checkbox', { name: 'Front Office' }));
  expect(onChange).toHaveBeenLastCalledWith(['users', 'reservations', 'rooms']);
});
