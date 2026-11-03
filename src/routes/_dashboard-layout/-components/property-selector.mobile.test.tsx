import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { createMockProperty, render } from '@/test-utils';

import PropertySelector from './property-selector';

// The phone's bottom sheet instead of the dropdown
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => true }));
vi.mock('sonner', () => ({ toast: { info: vi.fn(), error: vi.fn() } }));

const hotels = [
  createMockProperty('1', 'Zeta Inn', 'production'),
  createMockProperty('2', 'Alpha Hotel', 'staging'),
  createMockProperty('3', 'Mira Lodge', 'demo')
];

async function openSheet(value?: string) {
  const onValueChange = vi.fn<(propertyId: string) => Promise<void>>(
    async () => {}
  );
  render(
    <PropertySelector
      properties={hotels}
      total={hotels.length}
      value={value}
      onValueChange={onValueChange}
    />
  );
  const user = userEvent.setup();
  await user.click(screen.getByLabelText(/property/i));
  await screen.findByPlaceholderText(/search property/i);
  return { user, onValueChange };
}

const optionNames = (group: HTMLElement) =>
  within(group)
    .getAllByRole('option')
    .map((option) => option.textContent);

describe('PropertySelector on a phone', () => {
  test('shows the current property on its own, then the others by name', async () => {
    await openSheet('3');

    const current = screen.getByRole('group', { name: 'Current' });
    expect(optionNames(current)).toEqual([
      expect.stringContaining('Mira Lodge')
    ]);
    const all = screen.getByRole('group', { name: 'All properties' });
    expect(optionNames(all)).toEqual([
      expect.stringContaining('Alpha Hotel'),
      expect.stringContaining('Zeta Inn')
    ]);
  });

  test('has no current section before a property is chosen', async () => {
    await openSheet();

    expect(screen.getAllByRole('group')).toHaveLength(1);
    expect(screen.queryByText('Current')).not.toBeInTheDocument();
  });

  test('counts only while a search narrows the list', async () => {
    const { user } = await openSheet('1');

    expect(screen.queryByText(/^\d.* properties$/)).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/search property/i), 'Alpha');
    expect(await screen.findByText('1 of 3 properties')).toBeInTheDocument();
  });

  test('says so when the search matches nothing', async () => {
    const { user } = await openSheet('1');

    await user.type(screen.getByPlaceholderText(/search property/i), 'xyz');
    expect(await screen.findByText(/no properties found/i)).toBeVisible();
  });

  test('switches to the tapped property', async () => {
    const { user, onValueChange } = await openSheet('1');

    await user.click(screen.getByRole('option', { name: /Alpha Hotel/ }));
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('2'));
  });
});
