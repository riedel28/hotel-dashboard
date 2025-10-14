import { useEffect, useId, useRef, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';

interface AvatarSectionProps {
  currentAvatar?: string | null;
  userInitials?: string;
}

export function AvatarSection({
  currentAvatar,
  userInitials = 'U'
}: AvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(currentAvatar || null);
  const { t } = useLingui();
  const fileInputId = useId();

  const cleanupPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const handleFileSelect = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (!validTypes.includes(file.type)) {
      toast.error(t`Please select a valid image file (JPG, PNG, GIF)`);
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(t`File size must be less than 5MB`);
      return;
    }

    setIsLoading(true);

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      cleanupPreview();
      previewUrlRef.current = previewUrl;
      setAvatar(previewUrl);

      // TODO: Implement API call to upload avatar
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(t`Avatar updated successfully`);
    } catch {
      toast.error(t`Error uploading avatar`);
      cleanupPreview();
      setAvatar(currentAvatar || null);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsLoading(true);

    try {
      cleanupPreview();
      // TODO: Implement API call to remove avatar
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setAvatar(null);
      toast.success(t`Avatar removed successfully`);
    } catch {
      toast.error(t`Error removing avatar`);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      cleanupPreview();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>Profile Picture</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Upload a profile picture to personalize your account</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet className="gap-4">
          <Field orientation="horizontal" className="items-start gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={avatar || undefined} alt={t`Profile picture`} />
              <AvatarFallback className="text-lg font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <FieldContent className="gap-3">
              <FieldLabel htmlFor={fileInputId} className="sr-only">
                <Trans>Profile picture upload</Trans>
              </FieldLabel>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="w-fit"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {avatar ? (
                    <Trans>Change Image</Trans>
                  ) : (
                    <Trans>Upload Image</Trans>
                  )}
                </Button>

                {avatar && (
                  <Button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                    className="w-fit text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <Trans>Remove Image</Trans>
                  </Button>
                )}
              </div>
              <FieldDescription className="text-xs">
                <Trans>Supported formats: JPG, PNG, GIF (max 5MB)</Trans>
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldSet>

        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
