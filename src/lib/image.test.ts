import { describe, expect, test } from 'vitest';

import {
  ACCEPT_ATTRIBUTE,
  dataUriByteLength,
  formatBytes,
  ImageRejected,
  initialsColor,
  loadImageFile
} from './image';

describe('dataUriByteLength', () => {
  test('measures the decoded size, not the encoded string', () => {
    // "abc" -> "YWJj", no padding
    expect(dataUriByteLength('data:image/webp;base64,YWJj')).toBe(3);
  });

  test('accounts for one padding character', () => {
    // "abcd" -> "YWJjZA=="
    expect(dataUriByteLength('data:image/webp;base64,YWJjZA==')).toBe(4);
  });

  test('accounts for two padding characters', () => {
    // "abcde" -> "YWJjZGU="
    expect(dataUriByteLength('data:image/webp;base64,YWJjZGU=')).toBe(5);
  });
});

describe('formatBytes', () => {
  test('keeps small sizes in bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  test('switches to kilobytes', () => {
    expect(formatBytes(20 * 1024)).toBe('20 KB');
  });

  test('switches to megabytes with one decimal', () => {
    expect(formatBytes(Math.round(5.2 * 1024 * 1024))).toBe('5.2 MB');
  });
});

describe('initialsColor', () => {
  test('is stable for the same seed', () => {
    expect(initialsColor(42)).toBe(initialsColor(42));
    expect(initialsColor('42')).toBe(initialsColor(42));
  });

  test('differs across seeds', () => {
    const colors = new Set([1, 2, 3, 4, 5, 6, 7, 8].map(initialsColor));
    expect(colors.size).toBeGreaterThan(1);
  });

  test('always produces a hue in range', () => {
    for (let seed = 0; seed < 200; seed++) {
      const match = /^hsl\((\d+) 45% 42%\)$/.exec(initialsColor(seed));
      expect(match).not.toBeNull();
      expect(Number(match?.[1])).toBeLessThan(360);
    }
  });
});

describe('ACCEPT_ATTRIBUTE', () => {
  test('offers the formats a canvas can actually decode', () => {
    expect(ACCEPT_ATTRIBUTE).toContain('image/png');
    expect(ACCEPT_ATTRIBUTE).toContain('image/jpeg');
    expect(ACCEPT_ATTRIBUTE).toContain('image/webp');
    // HEIC is deliberately absent — no browser decodes it to a canvas.
    expect(ACCEPT_ATTRIBUTE).not.toContain('heic');
  });
});

describe('loadImageFile rejections', () => {
  test('flags HEIC by mime type, before trying to decode it', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'photo.HEIC', {
      type: 'image/heic'
    });

    await expect(loadImageFile(file)).rejects.toMatchObject({
      reason: 'unsupported-heic'
    });
  });

  test('flags HEIC by extension when the browser reports no mime type', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'IMG_0001.heif', {
      type: ''
    });

    await expect(loadImageFile(file)).rejects.toMatchObject({
      reason: 'unsupported-heic'
    });
  });

  test('rejects a non-image outright', async () => {
    const file = new File(['%PDF-1.7'], 'invoice.pdf', {
      type: 'application/pdf'
    });

    const error = await loadImageFile(file).catch((caught) => caught);
    expect(error).toBeInstanceOf(ImageRejected);
    expect(error.reason).toBe('not-an-image');
  });
});
