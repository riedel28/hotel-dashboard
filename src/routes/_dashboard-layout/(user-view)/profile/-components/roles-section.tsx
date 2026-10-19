import { Trans } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LockIcon } from 'lucide-react';

import { rolesQueryOptions } from '@/api/roles';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel
} from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

import type { Role } from '../../../../../../shared/types/users';
import { ProfileSection } from './profile-section';

interface RolesSectionProps {
  assignedRoles: Role[];
  isAdmin: boolean;
}

/**
 * The same roles box and admin switch an administrator sees in the user
 * drawer, read-only: what you have is what's ticked, and the rest of the list
 * shows what you don't.
 */
export function RolesSection({ assignedRoles, isAdmin }: RolesSectionProps) {
  const { data: roles } = useSuspenseQuery(rolesQueryOptions());
  const assignedIds = new Set(assignedRoles.map((role) => role.id));

  return (
    <ProfileSection
      id="roles"
      title={<Trans>Roles &amp; access</Trans>}
      description={<Trans>What you're allowed to do in the back-office.</Trans>}
      action={
        <Badge
          variant="outline"
          color="gray"
          size="sm"
          className="rounded-md px-2 py-1"
        >
          <LockIcon className="mr-0.5" aria-hidden="true" />
          <Trans>Read-only</Trans>
        </Badge>
      }
    >
      <CardContent className="space-y-6">
        <Field className="gap-2">
          <FieldLabel>
            <Trans>Roles</Trans>
          </FieldLabel>
          {roles.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 rounded-lg border p-3 sm:grid-cols-2 dark:bg-input/30">
              {roles.map((role) => (
                <Field key={role.id} orientation="horizontal" className="gap-2">
                  <Checkbox
                    id={`profile-role-${role.id}`}
                    checked={assignedIds.has(role.id)}
                    readOnly
                  />
                  <FieldLabel
                    htmlFor={`profile-role-${role.id}`}
                    className="font-normal"
                  >
                    {role.name}
                  </FieldLabel>
                </Field>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Trans>No roles available</Trans>
            </p>
          )}
        </Field>

        <Field
          orientation="horizontal"
          className="items-center gap-3 rounded-lg border p-3 dark:bg-input/30"
        >
          <FieldContent>
            <FieldLabel htmlFor="profile-is-admin">
              <Trans>Admin User</Trans>
            </FieldLabel>
            <FieldDescription>
              <Trans>
                Full access to every property and every staff account.
              </Trans>
            </FieldDescription>
          </FieldContent>
          <Switch id="profile-is-admin" checked={isAdmin} readOnly />
        </Field>

        {/* An administrator can change their own roles in Users. */}
        {!isAdmin && (
          <p className="text-sm text-muted-foreground">
            <Trans>
              To change your roles, contact your account administrator.
            </Trans>
          </p>
        )}
      </CardContent>
    </ProfileSection>
  );
}
