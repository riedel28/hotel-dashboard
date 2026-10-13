import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Room } from 'shared/types/rooms';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ApiError } from '@/api/client';
import { deleteRoomById } from '@/api/rooms';
import { render } from '@/test-utils';

import { DeleteDialog } from './delete-dialog';

vi.mock('@/api/rooms', () => ({ deleteRoomById: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const room: Room = {
  id: 7,
  name: 'Garden',
  property_id: '00000000-0000-4000-8000-000000000000',
  room_number: '12A',
  room_type: 'Suite',
  floor: 1,
  status: 'available',
  has_active_reservation: false,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z'
};

function renderDialog(overrides: Partial<Room> = {}) {
  const onOpenChange = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DeleteDialog
        open
        onOpenChange={onOpenChange}
        room={{ ...room, ...overrides }}
      />
    </QueryClientProvider>
  );
  return { onOpenChange, user: userEvent.setup() };
}

describe('DeleteDialog', () => {
  beforeEach(() => {
    vi.mocked(deleteRoomById).mockReset().mockResolvedValue();
    vi.mocked(toast.error).mockReset();
  });

  test('deletes the room after confirmation', async () => {
    const { user, onOpenChange } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(deleteRoomById).toHaveBeenCalledWith(7);
  });

  test('is blocked while the room has an active reservation', async () => {
    const { user } = renderDialog({ has_active_reservation: true });

    expect(screen.getByText('This room cannot be deleted')).toBeVisible();
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toBeDisabled();

    // The reason is on the button's wrapper, which can take focus
    await user.hover(button.parentElement!);
    expect(
      await screen.findByText('The room has an active reservation')
    ).toBeVisible();
    expect(deleteRoomById).not.toHaveBeenCalled();
  });

  test('reports a reservation made since the list was loaded', async () => {
    vi.mocked(deleteRoomById).mockRejectedValue(
      new ApiError('active', 'ROOM_HAS_ACTIVE_RESERVATION', 409)
    );
    const { user, onOpenChange } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'The room 12A has an active reservation and cannot be deleted'
      )
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
