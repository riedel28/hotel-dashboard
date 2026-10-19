import { Trans } from '@lingui/react/macro';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';

import { meQueryOptions, profileKeys } from '@/api/profile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { UnsavedChangesGuard } from '@/components/unsaved-changes-guard';

import { PersonalSection } from './-components/personal-section';
import { MobileSaveBar } from './-components/profile-section';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/profile/')(
  { component: RouteComponent }
);

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: user } = useSuspenseQuery(meQueryOptions());

  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [conflictOpen, setConflictOpen] = React.useState(false);

  const controls = React.useRef<{
    save: () => void;
    reset: () => void;
  } | null>(null);

  const registerControls = React.useCallback(
    (next: { save: () => void; reset: () => void }) => {
      controls.current = next;
    },
    []
  );

  return (
    <div className="pb-20 lg:pb-0">
      <PersonalSection
        user={user}
        onDirtyChange={setDirty}
        onSavingChange={setSaving}
        registerControls={registerControls}
        onConflict={() => setConflictOpen(true)}
      />

      <UnsavedChangesGuard when={dirty} />

      <MobileSaveBar
        visible={dirty}
        isSubmitting={saving}
        onSave={() => controls.current?.save()}
        onCancel={() => controls.current?.reset()}
      />

      <AlertDialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>This profile was updated elsewhere</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>
                Someone — most likely an administrator — changed your record
                while this page was open. Reload to see their version, or keep
                your edits and save again to overwrite it.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConflictOpen(false)}>
              <Trans>Keep my changes</Trans>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void queryClient.invalidateQueries({
                  queryKey: profileKeys.me
                });
                setConflictOpen(false);
              }}
            >
              <Trans>Reload</Trans>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
