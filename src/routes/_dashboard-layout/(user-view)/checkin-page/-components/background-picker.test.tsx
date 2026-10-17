import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { CheckinBackground } from 'shared/types/checkin';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { uploadCheckinBackground } from '@/api/checkin';
import { render } from '@/test-utils';

import { BackgroundPicker } from './background-picker';

vi.mock('@/api/checkin', () => ({ uploadCheckinBackground: vi.fn() }));
vi.mock('@/api/images', () => ({
  imageUrl: (id: string) => `/images/${id}`
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function Picker({
  initial = 'none',
  initialImage = null
}: {
  initial?: CheckinBackground;
  initialImage?: string | null;
}) {
  const [value, setValue] = useState({
    background: initial,
    image: initialImage
  });
  return (
    <>
      <BackgroundPicker
        background={value.background}
        customImageId={value.image}
        onChange={(background, image) => setValue({ background, image })}
      />
      <output data-testid="value">
        {value.background}:{value.image ?? '-'}
      </output>
    </>
  );
}

const value = () => screen.getByTestId('value').textContent;
const fileInput = () => screen.getByTestId<HTMLInputElement>('background-file');
const png = (bytes = 10) =>
  new File([new Uint8Array(bytes)], 'lobby.png', { type: 'image/png' });

describe('BackgroundPicker', () => {
  beforeEach(() => {
    vi.mocked(uploadCheckinBackground).mockReset().mockResolvedValue('img-1');
    vi.mocked(toast.error).mockReset();
  });

  test('starts on none and picks one tile', async () => {
    const user = userEvent.setup();
    render(<Picker />);
    expect(screen.getByRole('radio', { name: 'None' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Corridor' }));

    expect(value()).toBe('corridor:-');
    expect(screen.getByRole('radio', { name: 'Corridor' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'None' })).not.toBeChecked();
  });

  test('picks with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Picker />);

    screen.getByRole('radio', { name: 'None' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(value()).toBe('lobby:-');
  });

  test('uploads an image and picks it', async () => {
    const user = userEvent.setup();
    render(<Picker />);

    await user.upload(fileInput(), png());

    await waitFor(() => expect(value()).toBe('custom:img-1'));
    expect(screen.getByRole('radio', { name: 'Your image' })).toBeChecked();
  });

  test('refuses a file too large or of another type', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<Picker />);

    await user.upload(fileInput(), png(5 * 1024 * 1024 + 1));
    await user.upload(
      fileInput(),
      new File(['%PDF'], 'menu.pdf', { type: 'application/pdf' })
    );

    expect(toast.error).toHaveBeenCalledTimes(2);
    expect(uploadCheckinBackground).not.toHaveBeenCalled();
    expect(value()).toBe('none:-');
  });

  test('keeps the form as it was when the upload fails', async () => {
    vi.mocked(uploadCheckinBackground).mockRejectedValue(new Error('offline'));
    const user = userEvent.setup();
    render(<Picker initial="corridor" />);

    await user.upload(fileInput(), png());

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(value()).toBe('corridor:-');
  });

  test('removing the picked image goes back to none', async () => {
    const user = userEvent.setup();
    render(<Picker initial="custom" initialImage="img-0" />);

    await user.click(screen.getByRole('button', { name: 'Remove image' }));

    expect(value()).toBe('none:-');
    expect(
      screen.queryByRole('radio', { name: 'Your image' })
    ).not.toBeInTheDocument();
  });

  test('keeps the image while a preset is picked', async () => {
    const user = userEvent.setup();
    render(<Picker initial="custom" initialImage="img-0" />);

    await user.click(screen.getByRole('radio', { name: 'Entrance' }));

    expect(value()).toBe('entrance:img-0');
    expect(screen.getByRole('radio', { name: 'Your image' })).toBeVisible();
  });
});
