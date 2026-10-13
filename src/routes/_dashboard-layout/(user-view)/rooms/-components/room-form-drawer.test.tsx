import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Room } from 'shared/types/rooms';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ApiError } from '@/api/client';
import { createRoom, updateRoomById } from '@/api/rooms';
import { render } from '@/test-utils';

import { RoomFormDrawer } from './room-form-drawer';

vi.mock('@/api/rooms', () => ({
  createRoom: vi.fn(),
  updateRoomById: vi.fn()
}));
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

function renderDrawer(editing?: Room) {
  const onOpenChange = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RoomFormDrawer
        open
        onOpenChange={onOpenChange}
        room={editing}
        roomTypes={['Standard', 'Suite']}
      />
    </QueryClientProvider>
  );
  return { onOpenChange, user: userEvent.setup() };
}

describe('RoomFormDrawer', () => {
  beforeEach(() => {
    vi.mocked(createRoom).mockReset().mockResolvedValue(room);
    vi.mocked(updateRoomById).mockReset().mockResolvedValue(room);
  });

  test('requires number and type', async () => {
    const { user } = renderDrawer();

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Room number is required')).toBeVisible();
    expect(screen.getByText('Room type is required')).toBeVisible();
    expect(createRoom).not.toHaveBeenCalled();
  });

  test('creates a room and closes', async () => {
    const { user, onOpenChange } = renderDrawer();

    await user.type(screen.getByLabelText('Number'), ' 12A ');
    await user.type(screen.getByLabelText('Type'), 'Suite');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(createRoom).toHaveBeenCalledWith({
      room_number: '12A',
      name: '',
      room_type: 'Suite',
      floor: null,
      status: 'available'
    });
  });

  test('shows a taken number under the number field', async () => {
    vi.mocked(createRoom).mockRejectedValue(
      new ApiError('taken', 'ROOM_NUMBER_TAKEN', 409)
    );
    const { user, onOpenChange } = renderDrawer();

    await user.type(screen.getByLabelText('Number'), '12A');
    await user.type(screen.getByLabelText('Type'), 'Suite');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(
      await screen.findByText('A room with this number already exists')
    ).toBeVisible();
    expect(screen.getByLabelText('Number')).toBeInvalid();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test('edits a room, with the name locked by an active reservation', async () => {
    const { user } = renderDrawer({ ...room, has_active_reservation: true });

    expect(screen.getByLabelText('Number')).toHaveValue('12A');
    expect(screen.getByLabelText(/^Name/)).toBeDisabled();

    await user.clear(screen.getByLabelText('Type'));
    await user.type(screen.getByLabelText('Type'), 'Standard');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(updateRoomById).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ room_type: 'Standard', name: 'Garden' })
      )
    );
  });
});
