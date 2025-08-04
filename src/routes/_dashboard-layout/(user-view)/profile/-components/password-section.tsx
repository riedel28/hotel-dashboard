import { useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

export function PasswordSection() {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      // Validate password strength (basic validation)
      if (formData.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      // TODO: Implement API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success('Password changed successfully');

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch {
      toast.error('Error changing password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="profile.password.title"
            defaultMessage="Password"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="profile.password.description"
            defaultMessage="Change your password to keep your account secure"
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              <FormattedMessage
                id="profile.password.currentPassword"
                defaultMessage="Current Password"
              />
            </Label>
            <PasswordInput
              id="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange('currentPassword')}
              placeholder={intl.formatMessage({
                id: 'placeholders.password',
                defaultMessage: 'Enter your password'
              })}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              <FormattedMessage
                id="profile.password.newPassword"
                defaultMessage="New Password"
              />
            </Label>
            <PasswordInput
              id="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange('newPassword')}
              placeholder={intl.formatMessage({
                id: 'placeholders.password',
                defaultMessage: 'Enter your password'
              })}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              <FormattedMessage
                id="profile.password.confirmPassword"
                defaultMessage="Confirm New Password"
              />
            </Label>
            <PasswordInput
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              placeholder={intl.formatMessage({
                id: 'placeholders.password',
                defaultMessage: 'Enter your password'
              })}
              disabled={isLoading}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={isLoading}>
              <FormattedMessage
                id="profile.save"
                defaultMessage="Save Changes"
              />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
