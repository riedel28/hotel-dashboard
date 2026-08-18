import { Trans } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LockIcon, ZapIcon } from 'lucide-react';
import * as React from 'react';

import { rolesQueryOptions } from '@/api/roles';
import { Badge, type BadgeColorProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { Role } from '../../../../../../shared/types/users';
import { ProfileSection } from './profile-section';

/**
 * Colour by domain, not by importance — a glance should tell you which part of
 * the operation a role belongs to. Matched on name because roles carry no
 * metadata in the database (see CONTEXT.md: a Role is a label).
 */
function roleColor(name: string): BadgeColorProps {
  if (/administrator/i.test(name)) return 'indigo';
  if (/roomservice/i.test(name)) return 'orange';
  if (/housekeeping/i.test(name)) return 'teal';
  return 'gray';
}

/** Tester isn't a production role, so it reads as provisional. */
function isNonProduction(name: string) {
  return /tester/i.test(name);
}

function RoleChip({ role, assigned }: { role: Role; assigned: boolean }) {
  if (!assigned) {
    return (
      <Badge
        variant="outline"
        size="sm"
        className="border-dashed py-1 text-muted-foreground"
      >
        {role.name}
      </Badge>
    );
  }

  return (
    <Badge
      color={roleColor(role.name)}
      size="sm"
      className={cn('py-1', isNonProduction(role.name) && 'border-dashed')}
    >
      {role.name}
    </Badge>
  );
}

interface RolesSectionProps {
  assignedRoles: Role[];
  isAdmin: boolean;
}

export function RolesSection({ assignedRoles, isAdmin }: RolesSectionProps) {
  const [showAll, setShowAll] = React.useState(false);

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
      <CardContent className="space-y-5">
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="indigo" size="sm" className="gap-1 py-1">
              <ZapIcon aria-hidden="true" />
              <Trans>Administrator</Trans>
            </Badge>
            <span className="text-sm text-muted-foreground">
              <Trans>
                Full access to every property and every staff account.
              </Trans>
            </span>
          </div>
        )}

        {assignedRoles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {assignedRoles.map((role) => (
              <RoleChip key={role.id} role={role} assigned />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Trans>
              No roles assigned. Contact your administrator if you're missing
              access you need.
            </Trans>
          </p>
        )}

        <div>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-cyan-800 dark:text-cyan-200/85"
            onClick={() => setShowAll((open) => !open)}
            aria-expanded={showAll}
          >
            {showAll ? (
              <Trans>Hide other roles</Trans>
            ) : (
              <Trans>Show all roles</Trans>
            )}
          </Button>

          {showAll && (
            <React.Suspense fallback={<UnassignedSkeleton />}>
              <UnassignedRoles assignedRoles={assignedRoles} />
            </React.Suspense>
          )}
        </div>

        <p className="border-t pt-4 text-sm text-muted-foreground">
          <Trans>
            To change your roles, contact your account administrator.
          </Trans>
        </p>
      </CardContent>
    </ProfileSection>
  );
}

function UnassignedRoles({ assignedRoles }: { assignedRoles: Role[] }) {
  const { data: allRoles } = useSuspenseQuery(rolesQueryOptions());
  const assignedIds = new Set(assignedRoles.map((role) => role.id));
  const unassigned = allRoles.filter((role) => !assignedIds.has(role.id));

  if (unassigned.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        <Trans>You have every role that exists.</Trans>
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        <Trans>Not assigned</Trans>
      </p>
      <div className="flex flex-wrap gap-2">
        {unassigned.map((role) => (
          <RoleChip key={role.id} role={role} assigned={false} />
        ))}
      </div>
    </div>
  );
}

function UnassignedSkeleton() {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-6 w-28 rounded-lg" />
      ))}
    </div>
  );
}
