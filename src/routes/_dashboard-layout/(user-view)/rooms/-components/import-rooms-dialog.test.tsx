import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  RoomImportMode,
  RoomImportPreview,
  RoomImportRow
} from 'shared/types/room-imports';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ApiError } from '@/api/client';
import { applyRoomImport, previewRoomImport } from '@/api/rooms';
import { render } from '@/test-utils';

import { ImportRoomsDialog } from './import-rooms-dialog';

vi.mock('@/api/rooms', () => ({
  previewRoomImport: vi.fn(),
  applyRoomImport: vi.fn()
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const row = (
  line: number,
  status: RoomImportRow['status'],
  extra: Partial<RoomImportRow> = {}
): RoomImportRow => ({
  line,
  status,
  room_number: String(100 + line),
  name: `Room ${100 + line}`,
  room_type: 'Standard',
  floor: 1,
  is_new_type: false,
  errors: [],
  changes: [],
  ...extra
});

const rows = [
  row(2, 'new'),
  row(3, 'changed', {
    changes: [{ field: 'room_type', from: 'Standard', to: 'Suite' }]
  }),
  row(4, 'unchanged'),
  row(5, 'error', { room_number: '', errors: ['MISSING_NUMBER'] }),
  row(6, 'error', { errors: ['DUPLICATE_NUMBER', 'INVALID_FLOOR'] })
];

const previewOf = (mode: RoomImportMode): RoomImportPreview => ({
  mode,
  token: `token-${mode}`,
  rows,
  summary: {
    create: 1,
    update: 1,
    unchanged: 1,
    errors: 2,
    delete: mode === 'replace' ? 1 : 0
  },
  deletions:
    mode === 'replace'
      ? [
          {
            id: 1,
            room_number: '201',
            name: 'Room 201',
            has_active_reservation: false
          },
          {
            id: 2,
            room_number: '202',
            name: 'Room 202',
            has_active_reservation: true
          }
        ]
      : []
});

const csv = new File(['number,type\n101,Standard\n'], 'rooms.csv', {
  type: 'text/csv'
});

// Opens the dialog and uploads a file, landing on the preview step
async function renderPreview(file = csv) {
  const onOpenChange = vi.fn();
  // A dropped file skips the input's accept filter, so the test does too
  const user = userEvent.setup({ applyAccept: false });
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ImportRoomsDialog open onOpenChange={onOpenChange} />
    </QueryClientProvider>
  );
  await user.upload(screen.getByLabelText('File'), file);
  return { user, onOpenChange };
}

describe('ImportRoomsDialog', () => {
  beforeEach(() => {
    vi.mocked(previewRoomImport)
      .mockReset()
      .mockImplementation(async (_file, mode) => previewOf(mode));
    vi.mocked(applyRoomImport)
      .mockReset()
      .mockResolvedValue({ created: 1, updated: 1, deleted: 0, skipped: 2 });
    vi.mocked(toast.success).mockReset();
  });

  test('checks only extension and size before asking the server', async () => {
    await renderPreview(new File(['x'], 'rooms.pdf'));

    expect(
      await screen.findByText('Only .csv and .xlsx files can be imported.')
    ).toBeVisible();
    expect(previewRoomImport).not.toHaveBeenCalled();
  });

  test('sends the wizard back to the upload when the server refuses the file', async () => {
    vi.mocked(previewRoomImport).mockRejectedValue(
      new ApiError('missing', 'MISSING_COLUMNS', 400)
    );
    await renderPreview();

    expect(
      await screen.findByText('The file needs the columns "number" and "type".')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Choose file' })).toBeVisible();
  });

  test('previews a merge and imports its changes', async () => {
    const { user, onOpenChange } = await renderPreview();

    const summary = await screen.findByLabelText('Summary');
    expect(summary).toHaveTextContent('To create1');
    expect(summary).toHaveTextContent('Errors2');
    expect(summary).not.toHaveTextContent('To delete');
    // Rows that change nothing are hidden by default
    expect(screen.queryByText('Unchanged', { selector: 'span' })).toBeNull();
    expect(screen.getByText('Suite')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Import 2 changes' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(applyRoomImport).toHaveBeenCalledWith(csv, 'merge', 'token-merge');
    expect(toast.success).toHaveBeenCalledWith('Rooms imported', {
      description: 'Created 1, updated 1, deleted 0, skipped 2'
    });
  });

  test('switching the mode asks the server for a new preview', async () => {
    const { user } = await renderPreview();
    await screen.findByLabelText('Summary');
    expect(previewRoomImport).toHaveBeenCalledTimes(1);
    expect(previewRoomImport).toHaveBeenLastCalledWith(csv, 'merge');

    await user.click(screen.getByRole('button', { name: 'Replace all' }));

    await screen.findByLabelText('Rooms to delete');
    expect(previewRoomImport).toHaveBeenCalledTimes(2);
    expect(previewRoomImport).toHaveBeenLastCalledWith(csv, 'replace');
    expect(screen.getByLabelText('Summary')).toHaveTextContent('To delete1');
  });

  test('shows why rows are in error', async () => {
    const { user } = await renderPreview();
    await screen.findByLabelText('Summary');

    await user.click(screen.getByRole('button', { name: /^Errors/ }));

    expect(screen.getByText('No room number')).toBeVisible();
    expect(
      screen.getByText('The number appears more than once in the file')
    ).toBeVisible();
    expect(screen.getByText('The floor is not a whole number')).toBeVisible();
    expect(screen.queryByText('Suite')).toBeNull();
    expect(screen.getByText('Rows with errors are skipped.')).toBeVisible();
  });

  test('replacing needs the deletion confirmed first', async () => {
    const { user } = await renderPreview();
    await screen.findByLabelText('Summary');
    await user.click(screen.getByRole('button', { name: 'Replace all' }));

    const deletions = await screen.findByLabelText('Rooms to delete');
    expect(within(deletions).getByText('201')).toBeVisible();
    expect(
      within(deletions).getByText('Active reservation — will be skipped')
    ).toBeVisible();

    const replace = screen.getByRole('button', { name: 'Replace (delete 1)' });
    expect(replace).toBeDisabled();

    await user.click(
      screen.getByRole('checkbox', {
        name: 'I understand that 1 room will be deleted'
      })
    );
    expect(replace).toBeEnabled();

    await user.click(replace);
    await waitFor(() =>
      expect(applyRoomImport).toHaveBeenCalledWith(
        csv,
        'replace',
        'token-replace'
      )
    );
  });

  test('offers a fresh preview when the server says this one is stale', async () => {
    vi.mocked(applyRoomImport).mockRejectedValue(
      new ApiError('stale', 'IMPORT_PREVIEW_STALE', 409)
    );
    const { user, onOpenChange } = await renderPreview();
    await user.click(
      await screen.findByRole('button', { name: 'Import 2 changes' })
    );

    expect(
      await screen.findByText(/The rooms have changed since this preview/)
    ).toBeVisible();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Import 2 changes' })
    ).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Refresh preview' }));

    await waitFor(() => expect(previewRoomImport).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Import 2 changes' })
      ).toBeEnabled()
    );
    expect(screen.queryByText(/The rooms have changed/)).toBeNull();
  });
});
