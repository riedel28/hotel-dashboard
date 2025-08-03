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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RolesSectionProps {
  initialRoles?: string[];
}

const AVAILABLE_ROLES = [
  'administrators',
  'roomservice_manager',
  'housekeeping_manager',
  'roomservice_order_agent',
  'housekeeping_agent',
  'tester'
];

export function RolesSection({ initialRoles = [] }: RolesSectionProps) {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoles.length === 0) {
      toast.error(
        intl.formatMessage({
          id: 'profile.roles.error.noRolesSelected',
          defaultMessage: 'Please select at least one role'
        })
      );
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement API call to update user roles
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(
        intl.formatMessage({
          id: 'profile.roles.saved',
          defaultMessage: 'Roles updated successfully'
        })
      );
    } catch {
      toast.error(
        intl.formatMessage({
          id: 'profile.roles.error',
          defaultMessage: 'Error updating roles'
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
            id="profile.roles.title"
            defaultMessage="User Roles"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="profile.roles.description"
            defaultMessage="Manage your user roles and permissions"
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">
              <FormattedMessage
                id="profile.roles.label"
                defaultMessage="Roles"
              />
            </Label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {AVAILABLE_ROLES.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <Label
                    htmlFor={role}
                    className="cursor-pointer text-sm font-normal"
                  >
                    <FormattedMessage
                      id={`profile.roles.${role}`}
                      defaultMessage="Role"
                    />
                  </Label>
                </div>
              ))}
            </div>

            {selectedRoles.length === 0 && (
              <p className="text-destructive text-sm">
                <FormattedMessage
                  id="profile.roles.error.noRolesSelected"
                  defaultMessage="Please select at least one role"
                />
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <FormattedMessage
                  id="profile.roles.saving"
                  defaultMessage="Saving..."
                />
              ) : (
                <FormattedMessage
                  id="profile.roles.save"
                  defaultMessage="Save Roles"
                />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
