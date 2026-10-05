/**
 * Client-side image handling for avatars. Everything here runs before upload:
 * the server only ever sees a small square WebP data URI
 * (docs/adr/0001-avatar-as-data-uri.md).
 */

/** Stored edge length. 2× the 96px display size, so it stays crisp on retina. */
export const AVATAR_OUTPUT_SIZE = 256;

/** Below this the crop will look soft — worth a warning, not a refusal. */
export const AVATAR_MIN_SOURCE_SIZE = 200;

/** What the file picker and the drop zone accept. */
export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif'
] as const;

export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',');

export type ImageRejectionReason =
  | 'not-an-image'
  | 'unsupported-heic'
  | 'unreadable';

export class ImageRejected extends Error {
  reason: ImageRejectionReason;

  constructor(reason: ImageRejectionReason) {
    super(reason);
    this.name = 'ImageRejected';
    this.reason = reason;
  }
}

/**
 * iPhones hand out HEIC, which no browser can decode into a canvas. Detected
 * separately from "not an image" so the user gets an actionable message rather
 * than being told their photo isn't a photo.
 */
function isHeic(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

export interface LoadedImage {
  element: HTMLImageElement;
  objectUrl: string;
  width: number;
  height: number;
  /** True when the source is smaller than we'd like — caller may warn. */
  lowResolution: boolean;
}

/**
 * Decodes a picked file. The caller owns the returned object URL and must call
 * `releaseImage` once the cropper is closed.
 */
export async function loadImageFile(file: File): Promise<LoadedImage> {
  if (isHeic(file)) {
    throw new ImageRejected('unsupported-heic');
  }

  if (!file.type.startsWith('image/')) {
    throw new ImageRejected('not-an-image');
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const element = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new ImageRejected('unreadable'));
      img.src = objectUrl;
    });

    return {
      element,
      objectUrl,
      width: element.naturalWidth,
      height: element.naturalHeight,
      lowResolution:
        Math.min(element.naturalWidth, element.naturalHeight) <
        AVATAR_MIN_SOURCE_SIZE
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

export function releaseImage(image: Pick<LoadedImage, 'objectUrl'>) {
  URL.revokeObjectURL(image.objectUrl);
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Renders the chosen crop to a fixed-size square WebP data URI.
 *
 * An animated GIF collapses to its first frame here, which is what drawImage
 * gives us — deliberate, since this is a back-office and not a social network.
 */
export async function cropToAvatarDataUri(
  source: CanvasImageSource,
  crop: CropArea,
  quality = 0.82
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new ImageRejected('unreadable');
  }

  context.imageSmoothingQuality = 'high';
  context.drawImage(
    source,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE
  );

  return canvas.toDataURL('image/webp', quality);
}

/** Rough decoded size of a base64 data URI, for reporting and for guard rails. */
export function dataUriByteLength(dataUri: string): number {
  const base64 = dataUri.slice(dataUri.indexOf(',') + 1);
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
