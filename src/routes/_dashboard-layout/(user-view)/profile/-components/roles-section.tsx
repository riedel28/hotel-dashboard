import { Trans } from '@lingui/react/macro';

import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { Link } from '@/components/ui/link';

import type { Role } from '../../../../../../shared/types/users';
import { ProfileSection } from './profile-section';

interface RolesSectionProps {
  assignedRoles: Role[];
  isAdmin: boolean;
}

/**
 * A summary, not a form: roles and the admin flag are set by an administrator
 * in Users, so nothing here looks editable.
 */
export function RolesSection({ assignedRoles, isAdmin }: RolesSectionProps) {
  return (
    <ProfileSection
      id="roles"
      title={<Trans>Roles &amp; access</Trans>}
      description={<Trans>What you're allowed to do in the back-office.</Trans>}
    >
      <CardContent className="space-y-6">
        <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 text-sm">
          <dt className="font-medium">
            <Trans>Access</Trans>
          </dt>
          <dd className="space-y-0.5">
            {isAdmin ? (
              <>
                <p>
                  <Trans>Administrator</Trans>
                </p>
                <p className="text-muted-foreground">
                  <Trans>
                    Full access to every property and every staff account.
                  </Trans>
                </p>
              </>
            ) : (
              <p>
                <Trans>Standard</Trans>
              </p>
            )}
          </dd>

          <dt className="font-medium">
            <Trans>Roles</Trans>
          </dt>
          <dd>
            {assignedRoles.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {assignedRoles.map((role) => (
                  <li key={role.id}>
                    <Badge variant="outline" color="gray" size="sm">
                      {role.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                <Trans>None</Trans>
              </p>
            )}
          </dd>
        </dl>

        <p className="text-sm text-muted-foreground">
          {isAdmin ? (
            <Trans>
              Roles and admin rights are managed in{' '}
              <Link to="/users">Users</Link>.
            </Trans>
          ) : (
            <Trans>
              To change your roles, contact your account administrator.
            </Trans>
          )}
        </p>
      </CardContent>
    </ProfileSection>
  );
}
