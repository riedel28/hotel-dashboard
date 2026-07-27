import { describe, expect, test } from 'vitest';

import {
  ACCEPT_ATTRIBUTE,
  dataUriByteLength,
  formatBytes,
  ImageRejected,
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
