import { Trans, useLingui } from '@lingui/react/macro';
import { Loader2Icon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import * as React from 'react';
import Cropper, { type Area } from 'react-easy-crop';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { cropToAvatarDataUri, type LoadedImage } from '@/lib/image';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

interface AvatarCropperDialogProps {
  image: LoadedImage | null;
  onCancel: () => void;
  onConfirm: (dataUri: string) => void;
}

/**
 * Square crop with a circular mask, matching how the avatar is actually shown.
 * Without this step portraits get centre-cropped at whatever aspect ratio the
 * camera produced, which reliably lops off the top of people's heads.
 */
export function AvatarCropperDialog({
  image,
  onCancel,
  onConfirm
}: AvatarCropperDialogProps) {
  const { t } = useLingui();
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [pixelCrop, setPixelCrop] = React.useState<Area | null>(null);
  const [isRendering, setIsRendering] = React.useState(false);

  // Reset the view whenever a different picture comes in, otherwise the second
  // upload starts at the first one's pan and zoom.
  React.useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPixelCrop(null);
  }, []);

  const handleConfirm = async () => {
    if (!image || !pixelCrop) return;

    setIsRendering(true);
    try {
      onConfirm(await cropToAvatarDataUri(image.element, pixelCrop));
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <Dialog
      open={image !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <Trans>Position your photo</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Drag to move, pinch or use the slider to zoom.</Trans>
          </DialogDescription>
        </DialogHeader>

        {image && (
          <>
            <div className="bg-muted relative h-72 w-full overflow-hidden rounded-lg">
              <Cropper
                image={image.objectUrl}
                crop={crop}
                zoom={zoom}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_area, areaPixels) => setPixelCrop(areaPixels)}
              />
            </div>

            <div className="flex items-center gap-3">
              <ZoomOutIcon
                className="text-muted-foreground size-4 shrink-0"
                aria-hidden="true"
              />
              <Slider
                value={[zoom]}
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.01}
                onValueChange={(value) => {
                  const next = Array.isArray(value) ? value[0] : value;
                  if (typeof next === 'number') setZoom(next);
                }}
                aria-label={t`Zoom`}
                className="flex-1"
              />
              <ZoomInIcon
                className="text-muted-foreground size-4 shrink-0"
                aria-hidden="true"
              />
            </div>

            {image.lowResolution && (
              <p className="text-sm text-amber-600 dark:text-amber-500">
                <Trans>
                  This image is small, so it may look blurry once cropped.
                </Trans>
              </p>
            )}
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            <Trans>Cancel</Trans>
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!pixelCrop || isRendering}
            aria-busy={isRendering}
          >
            {isRendering && (
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            )}
            <Trans>Save photo</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
