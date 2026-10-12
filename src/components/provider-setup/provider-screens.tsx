import { Trans } from '@lingui/react/macro';
import * as React from 'react';
import type { ConfigurableKind, Provider } from 'shared/types/providers';

import { useAuth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProvider } from '@/hooks/use-provider';

import { ProviderPicker } from './provider-picker';
import type { ProviderEntry } from './types';

interface ProviderScreensProps<K extends ConfigurableKind> {
  kind: K;
  pickerTitle: React.ReactNode;
  pickerDescription: React.ReactNode;
  /** Every provider of this kind, in the order the picker shows them. */
  providers: ProviderEntry<K>[];
}

/**
 * The screens of a provider page: the picker for a property that has no
 * provider of this kind, otherwise the form of the one it has.
 */
export function ProviderScreens<K extends ConfigurableKind>(
  props: ProviderScreensProps<K>
) {
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useProvider(props.kind);

  if (isPending) {
    return <Skeleton className="h-96 max-w-4xl rounded-xl" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground" role="alert">
          <Trans>Failed to load the provider.</Trans>
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <Trans>Try again</Trans>
        </Button>
      </div>
    );
  }

  // Keyed by property: switching it starts over from that property's state.
  return <Screens key={user?.selected_property_id} saved={data} {...props} />;
}

function Screens<K extends ConfigurableKind>({
  saved,
  pickerTitle,
  pickerDescription,
  providers
}: ProviderScreensProps<K> & { saved: Provider<K> | null }) {
  const stored = providers.find((provider) => provider.id === saved?.provider);
  // The provider whose form is open, or null for the picker. A property
  // without a provider starts on the picker, one with a provider on its form.
  const [open, setOpen] = React.useState(stored?.Form ? stored : null);

  if (!open?.Form) {
    return (
      <ProviderPicker
        title={pickerTitle}
        description={pickerDescription}
        providers={providers}
        current={saved?.provider}
        onSelect={setOpen}
        onBack={stored?.Form ? () => setOpen(stored) : undefined}
      />
    );
  }

  const isStored = saved?.provider === open.id;

  return (
    <open.Form
      // A form per provider: its state does not carry over to another one's
      key={open.id}
      entry={open}
      saved={isStored ? saved : null}
      // Whatever is stored goes when another provider is set up, even one this
      // page no longer lists: then it is named by its id
      replaces={saved && !isStored ? (stored?.name ?? saved.provider) : null}
      onChooseProvider={() => setOpen(null)}
    />
  );
}
