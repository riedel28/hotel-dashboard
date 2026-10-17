import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { render } from '@/test-utils';

import { ImageField } from './image-field';

vi.mock('@/api/images', () => ({
  imageUrl: (id: string) => `/images/${id}`
}));

function Gallery({
  initial,
  upload = vi.fn()
}: {
  initial: string[];
  upload?: (file: File) => Promise<string>;
}) {
  const [ids, setIds] = useState(initial);
  return (
    <>
      <ImageField
        value={ids}
        onChange={setIds}
        cover
        maxBytes={5 * 1024 * 1024}
        upload={upload}
      />
      <output data-testid="order">{ids.join(',')}</output>
    </>
  );
}

const order = () => screen.getByTestId('order').textContent;
const tile = (index: number) =>
  screen
    .getByAltText(`Image ${index}`)
    .closest<HTMLElement>('[draggable="true"]')!;

describe('ImageField as an event gallery', () => {
  test('marks the first image as the cover', () => {
    render(<Gallery initial={['a', 'b']} />);
    expect(within(tile(1)).getByText('Cover')).toBeInTheDocument();
    expect(within(tile(2)).queryByText('Cover')).not.toBeInTheDocument();
  });

  test('moving an image to the front makes it the cover', async () => {
    const user = userEvent.setup();
    render(<Gallery initial={['a', 'b', 'c']} />);

    await user.click(
      within(tile(2)).getByRole('button', { name: 'Move left' })
    );

    expect(order()).toBe('b,a,c');
    expect(within(tile(1)).getByText('Cover')).toBeInTheDocument();
    expect(screen.getByAltText('Image 1')).toHaveAttribute('src', '/images/b');
  });

  test('removing the cover hands it to the next image', async () => {
    const user = userEvent.setup();
    render(<Gallery initial={['a', 'b']} />);

    await user.click(
      within(tile(1)).getByRole('button', { name: 'Remove image' })
    );

    expect(order()).toBe('b');
    expect(within(tile(1)).getByText('Cover')).toBeInTheDocument();
  });

  test('uploads picked images and refuses too large or foreign files', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const upload = vi.fn(async (file: File) => `id-${file.name}`);
    const { container } = render(<Gallery initial={[]} upload={upload} />);
    const input = container.querySelector('input[type="file"]')!;

    await user.upload(input as HTMLInputElement, [
      new File(['x'], 'ok.png', { type: 'image/png' }),
      new File([new Uint8Array(6 * 1024 * 1024)], 'big.jpg', {
        type: 'image/jpeg'
      }),
      new File(['x'], 'notes.pdf', { type: 'application/pdf' })
    ]);

    await waitFor(() => expect(order()).toBe('id-ok.png'));
    expect(upload).toHaveBeenCalledTimes(1);
    expect(screen.getByText('The file is larger than 5.0 MB')).toBeVisible();
    expect(screen.getByText('Only JPG, PNG and WebP images')).toBeVisible();
  });

  test('opens an image at full size and steps through them', async () => {
    const user = userEvent.setup();
    render(<Gallery initial={['a', 'b']} />);

    await user.click(screen.getByRole('button', { name: 'Open image 2' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Image 2 of 2')).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole('button', { name: 'Next image' })
    );
    expect(within(dialog).getByText('Image 1 of 2')).toBeInTheDocument();
    expect(within(dialog).getByText('Cover')).toBeInTheDocument();
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/images/a');
  });
});
