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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PersonalSectionProps {
  initialData?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function PersonalSection({ initialData }: PersonalSectionProps) {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || ''
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
      // TODO: Implement API call to update personal information
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(
        intl.formatMessage({
          id: 'profile.saved',
          defaultMessage: 'Profile updated successfully'
        })
      );
    } catch {
      toast.error(
        intl.formatMessage({
          id: 'profile.error',
          defaultMessage: 'Error updating profile'
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="profile.personal.title"
            defaultMessage="Personal Information"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="profile.personal.description"
            defaultMessage="Update your personal information and contact details"
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                <FormattedMessage
                  id="profile.personal.firstName"
                  defaultMessage="First Name"
                />
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                placeholder={intl.formatMessage({
                  id: 'placeholders.enterFirstName',
                  defaultMessage: 'Enter first name'
                })}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                <FormattedMessage
                  id="profile.personal.lastName"
                  defaultMessage="Last Name"
                />
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                placeholder={intl.formatMessage({
                  id: 'placeholders.enterLastName',
                  defaultMessage: 'Enter last name'
                })}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              <FormattedMessage
                id="profile.personal.email"
                defaultMessage="Email"
              />
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder={intl.formatMessage({
                id: 'placeholders.email',
                defaultMessage: 'Enter your email'
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
