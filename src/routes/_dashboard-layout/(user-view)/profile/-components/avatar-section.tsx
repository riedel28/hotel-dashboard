import { useRef, useState } from 'react';

import { Camera, Trash2 } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
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

interface AvatarSectionProps {
  currentAvatar?: string | null;
  userInitials?: string;
}

export function AvatarSection({
  currentAvatar,
  userInitials = 'U'
}: AvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(currentAvatar || null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsLoading(true);

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatar(previewUrl);

      // TODO: Implement API call to upload avatar
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success('Avatar updated successfully');
    } catch {
      toast.error('Error uploading avatar');
      setAvatar(currentAvatar || null);
    } finally {
      setIsLoading(false);
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
      // TODO: Implement API call to remove avatar
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setAvatar(null);
      toast.success('Avatar removed successfully');
    } catch {
      toast.error('Error removing avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="profile.avatar.title"
            defaultMessage="Profile Picture"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="profile.avatar.description"
            defaultMessage="Upload a profile picture to personalize your account"
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="border-border h-20 w-20 border-2">
              <AvatarImage src={avatar || undefined} alt="Profile picture" />
              <AvatarFallback className="text-lg font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleUploadClick}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="w-fit"
              >
                <Camera className="mr-2 h-4 w-4" />
                {avatar ? (
                  <FormattedMessage
                    id="profile.avatar.change"
                    defaultMessage="Change Image"
                  />
                ) : (
                  <FormattedMessage
                    id="profile.avatar.upload"
                    defaultMessage="Upload Image"
                  />
                )}
              </Button>

              {avatar && (
                <div className="relative">
                  <Button
                    onClick={handleRemoveAvatar}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-fit transition-colors duration-200"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <FormattedMessage
                      id="profile.avatar.remove"
                      defaultMessage="Remove Image"
                    />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <p className="text-muted-foreground text-xs">
            <FormattedMessage
              id="profile.avatar.supportedFormats"
              defaultMessage="Supported formats: JPG, PNG, GIF (max 5MB)"
            />
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}
