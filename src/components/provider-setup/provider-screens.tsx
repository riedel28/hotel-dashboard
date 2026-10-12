import { Trans } from '@lingui/react/macro';
import * as React from 'react';
import type { ConfigurableKind, Provider } from 'shared/types/providers';

import { useAuth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProvider } from '@/hooks/use-provider';

import { type ProviderOption, ProviderPicker } from './provider-picker';

/** What the open provider's form is given. */
export interface ProviderFormProps<
  K extends ConfigurableKind,
  Id extends string
> {
  /** The provider whose form this is. */
  provider: Id;
  /** The property's stored provider of this kind, whichever one it is. */
  saved: Provider<K> | null;
  /**
   * The name of the provider that setting this one up would replace: set while
   * another one is stored.
   */
  replaces: string | null;
  /** Opens the picker: "Back" during setup, "Change provider" after. */
  onChooseProvider: () => void;
}

interface ProviderScreensProps<K extends ConfigurableKind, Id extends string> {
  kind: K;
  pickerTitle: React.ReactNode;
  pickerDescription: React.ReactNode;
  options: ProviderOption<Id>[];
  renderForm: (props: ProviderFormProps<K, Id>) => React.ReactNode;
}

/**
 * The screens of a provider page: the picker for a property that has no
 * provider of this kind, otherwise the form of the one it has.
 */
export function ProviderScreens<K extends ConfigurableKind, Id extends string>(
  props: ProviderScreensProps<K, Id>
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

function Screens<K extends ConfigurableKind, Id extends string>({
  saved,
  pickerTitle,
  pickerDescription,
  options,
  renderForm
}: ProviderScreensProps<K, Id> & { saved: Provider<K> | null }) {
  const stored = options.find((option) => option.id === saved?.provider);
  // The provider whose form is open, or null for the picker. A property
  // without a provider starts on the picker, one with a provider on its form.
  const [open, setOpen] = React.useState<Id | null>(stored?.id ?? null);

  if (open === null) {
    return (
      <ProviderPicker
        title={pickerTitle}
        description={pickerDescription}
        options={options}
        current={stored?.id}
        onSelect={setOpen}
        onBack={stored ? () => setOpen(stored.id) : undefined}
      />
    );
  }

  return renderForm({
    provider: open,
    saved,
    replaces: stored && stored.id !== open ? stored.name : null,
    onChooseProvider: () => setOpen(null)
  });
}
