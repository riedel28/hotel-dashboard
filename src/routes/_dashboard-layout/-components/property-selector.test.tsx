import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createMockProperty, render } from '@/test-utils';

import PropertySelector from './property-selector';

const mockToastInfo = vi.fn();
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    info: (...args: unknown[]) => mockToastInfo(...args),
    error: (...args: unknown[]) => mockToastError(...args)
  }
}));

const hotels = [
  createMockProperty('1', 'Hotel A', 'production'),
  createMockProperty('2', 'Hotel B', 'staging'),
  createMockProperty('3', 'Hotel C', 'demo'),
  createMockProperty('4', 'Hotel D', 'template')
];

function renderSelector(
  props: Partial<ComponentProps<typeof PropertySelector>> = {}
) {
  const properties = props.properties ?? hotels;
  return render(
    <PropertySelector
      properties={properties}
      total={properties.length}
      onValueChange={vi.fn<(propertyId: string) => Promise<void>>(
        async () => {}
      )}
      {...props}
    />
  );
}

async function open() {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText(/select property/i));
  await screen.findByPlaceholderText(/search property/i);
  return user;
}

describe('PropertySelector', () => {
  beforeEach(() => {
    mockToastInfo.mockClear();
    mockToastError.mockClear();
  });

  describe('Trigger', () => {
    test('shows a placeholder when no property is selected', () => {
      renderSelector();
      expect(screen.getByText('Select property')).toBeInTheDocument();
    });

    test('shows the selected property', () => {
      renderSelector({ value: '2' });
      expect(screen.getByText('Hotel B')).toBeInTheDocument();
      expect(screen.queryByText('Select property')).not.toBeInTheDocument();
    });

    test('shows the placeholder when the selected id is not in the list', () => {
      renderSelector({ value: 'gone' });
      expect(screen.getByText('Select property')).toBeInTheDocument();
    });
  });

  describe('List', () => {
    test('lists every property with its stage', async () => {
      renderSelector();
      await open();

      for (const hotel of hotels) {
        expect(
          screen.getByRole('option', { name: new RegExp(hotel.name) })
        ).toBeInTheDocument();
      }
      expect(screen.getByText(/production/i)).toBeInTheDocument();
      expect(screen.getByText(/staging/i)).toBeInTheDocument();
      expect(screen.getByText(/demo/i)).toBeInTheDocument();
      expect(screen.getByText(/template/i)).toBeInTheDocument();
    });

    test('marks the selected property and no other', async () => {
      renderSelector({ value: '2' });
      await open();

      expect(screen.getByRole('option', { name: /Hotel B/ })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(screen.getByRole('option', { name: /Hotel A/ })).toHaveAttribute(
        'aria-selected',
        'false'
      );
    });

    test('shows the empty message when the search matches nothing', async () => {
      renderSelector();
      const user = await open();

      await user.type(
        screen.getByPlaceholderText(/search property/i),
        'NonExistentHotel'
      );

      await waitFor(() => {
        expect(screen.getByText(/no properties found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Selecting', () => {
    test('reports the chosen property by id and announces the switch once it succeeds', async () => {
      let confirm = () => {};
      const handleValueChange = vi.fn<(propertyId: string) => Promise<void>>(
        () => new Promise<void>((resolve) => (confirm = resolve))
      );
      renderSelector({ onValueChange: handleValueChange });
      const user = await open();

      await user.click(screen.getByRole('option', { name: /Hotel C/ }));

      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith('3');
      });
      // Nothing is announced while the switch is still in flight.
      expect(mockToastInfo).not.toHaveBeenCalled();

      confirm();

      await waitFor(() => {
        expect(mockToastInfo).toHaveBeenCalledWith('Switched to Hotel C');
      });
      expect(mockToastError).not.toHaveBeenCalled();
    });

    test('reports a failed switch instead of announcing it', async () => {
      renderSelector({
        onValueChange: vi.fn<(propertyId: string) => Promise<void>>(() =>
          Promise.reject(new Error('offline'))
        )
      });
      const user = await open();

      await user.click(screen.getByRole('option', { name: /Hotel C/ }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Failed to switch to Hotel C'
        );
      });
      expect(mockToastInfo).not.toHaveBeenCalled();
    });
  });

  describe('Opening', () => {
    test('calls onOpen each time the list opens', async () => {
      const handleOpen = vi.fn<() => void>();
      renderSelector({ onOpen: handleOpen });
      await open();

      expect(handleOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe('Count', () => {
    test('shows how many properties there are', async () => {
      renderSelector();
      await open();
      expect(screen.getByText('4 properties')).toBeInTheDocument();
    });

    test('uses the singular for one', async () => {
      renderSelector({ properties: hotels.slice(0, 1) });
      await open();
      expect(screen.getByText('1 property')).toBeInTheDocument();
    });

    test('says so when the list is only the first part of them', async () => {
      renderSelector({ total: 137 });
      await open();
      expect(screen.getByText('First 4 of 137 properties')).toBeInTheDocument();
    });
  });
});
