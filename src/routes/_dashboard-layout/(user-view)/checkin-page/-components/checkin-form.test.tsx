import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type CheckinSettings,
  defaultCheckinSettings
} from 'shared/types/checkin';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { saveCheckinSettings } from '@/api/checkin';
import { render } from '@/test-utils';

import { CheckinForm } from './checkin-form';

vi.mock('@/api/checkin', () => ({
  saveCheckinSettings: vi.fn(),
  uploadCheckinBackground: vi.fn()
}));
vi.mock('@/api/images', () => ({
  imageUrl: (id: string) => `/images/${id}`
}));
// It blocks navigation, which needs a router.
vi.mock('@/components/unsaved-changes-guard', () => ({
  UnsavedChangesGuard: () => null
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const settings: CheckinSettings = {
  enabled: true,
  ...defaultCheckinSettings,
  guest_url: 'https://hotel.example.com/checkin'
};

function renderForm(overrides: Partial<CheckinSettings> = {}) {
  const onDeactivate = vi.fn(async () => {});
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CheckinForm
        settings={{ ...settings, ...overrides }}
        onSaved={vi.fn()}
        onDeactivate={onDeactivate}
        isDeactivating={false}
      />
    </QueryClientProvider>
  );
  return { onDeactivate, user: userEvent.setup() };
}

const firstSend = () => screen.getByRole('combobox', { name: 'First send' });
const reminder = () => screen.getByRole('combobox', { name: 'Reminder' });

describe('CheckinForm', () => {
  beforeEach(() => {
    vi.mocked(saveCheckinSettings)
      .mockReset()
      .mockImplementation(async (data) => ({ ...settings, ...data }));
  });

  test('will not save a reminder no closer to arrival than the first send', async () => {
    const { user } = renderForm({ first_send_days: 2, reminder_days: 1 });

    await user.click(reminder());
    await user.click(
      await screen.findByRole('option', { name: '2 days before arrival' })
    );

    expect(
      await screen.findByText(
        'The reminder must go out closer to arrival than the first send'
      )
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(saveCheckinSettings).not.toHaveBeenCalled();

    // Moving the first send away fixes it.
    await user.click(firstSend());
    await user.click(
      await screen.findByRole('option', { name: '7 days before arrival' })
    );
    await waitFor(() =>
      expect(
        screen.queryByText(
          'The reminder must go out closer to arrival than the first send'
        )
      ).not.toBeInTheDocument()
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(saveCheckinSettings).toHaveBeenCalled());
    expect(vi.mocked(saveCheckinSettings).mock.calls[0]![0]).toMatchObject({
      first_send_days: 7,
      reminder_days: 2
    });
  });

  test('disables the send days while links are not sent automatically', async () => {
    const { user } = renderForm();
    expect(firstSend()).toBeEnabled();

    await user.click(
      screen.getByRole('switch', {
        name: 'Send the check-in link automatically'
      })
    );

    expect(firstSend()).toBeDisabled();
    expect(reminder()).toBeDisabled();
    expect(
      screen.getByText('You can send the link by hand from a reservation.')
    ).toBeVisible();
    // The days are kept.
    expect(firstSend()).toHaveTextContent('5 days before arrival');
  });

  test('deactivates only once confirmed', async () => {
    const { user, onDeactivate } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent(
      'Guests will no longer receive check-in links.'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(onDeactivate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Deactivate'
      })
    );
    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });

  test('warns that deactivating drops unsaved changes', async () => {
    const { user } = renderForm();

    await user.click(screen.getByRole('radio', { name: 'Corridor' }));
    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      'Your unsaved changes will be lost.'
    );
  });

  test('shows the guest URL, or why there is none', () => {
    renderForm();
    expect(screen.getByRole('textbox', { name: 'Guest page URL' })).toHaveValue(
      settings.guest_url
    );
    expect(screen.getByText('Preview').closest('a')).toHaveAttribute(
      'href',
      settings.guest_url
    );
  });

  test('explains a missing guest app domain', () => {
    renderForm({ guest_url: null });
    expect(
      screen.queryByRole('textbox', { name: 'Guest page URL' })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/no guest app domain yet/)).toBeVisible();
  });
});
