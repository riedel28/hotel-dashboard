import { Trans, useLingui } from '@lingui/react/macro';
import { ChevronRightIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import type {
  GuestAgeGroup,
  GuestInput,
  ReservationFormData
} from 'shared/types/reservations';

import { Button } from '@/components/ui/button';
import { CountryFlag } from '@/components/ui/country-flag';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { NumberInput } from '@/components/ui/number-input';
import { cn } from '@/lib/utils';

import { AGE_GROUPS, ageGroupLabel } from '../-lib/age-groups';
import {
  defaultAgeGroup,
  getPlaces,
  normalizeOccupancy
} from '../-lib/occupancy';
import { GuestDialog } from './guest-dialog';
import { GuestSearchCombobox } from './guest-search-combobox';

/** The small labels that split the guest list into its two parts. */
const listHeading = 'text-xs font-medium text-muted-foreground';

// What a guest card and a free place share: a full-width row that reads as clickable
const listRow =
  'group flex w-full cursor-pointer gap-2.5 rounded-lg border border-input px-3 py-2 text-left transition-colors outline-none hover:border-foreground/5 hover:bg-accent focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)]';

/** Which guest the dialog is open for: one on the list, or a new one for a group. */
type DialogTarget = { index: number } | { group: GuestAgeGroup };

interface GuestsSectionProps {
  form: UseFormReturn<ReservationFormData>;
}

/**
 * Who is staying: the head counts (the plan) and the guest list (the names).
 * Every change to the list goes through `normalizeOccupancy`, which keeps a
 * primary guest and grows the counts to fit.
 */
export function GuestsSection({ form }: GuestsSectionProps) {
  const { t } = useLingui();
  const [dialog, setDialog] = useState<DialogTarget | null>(null);

  const [adults, youth, children, infants, guests] = form.watch([
    'adults',
    'youth',
    'children',
    'infants',
    'guests'
  ]);
  const occupancy = { adults, youth, children, infants, guests };
  const places = getPlaces(occupancy);
  const plannedTotal = adults + youth + children + infants;

  const setGuests = (next: GuestInput[]) => {
    const normalized = normalizeOccupancy({ ...occupancy, guests: next });
    form.setValue('guests', normalized.guests, { shouldDirty: true });
    for (const { field } of AGE_GROUPS) {
      if (normalized[field] !== occupancy[field]) {
        form.setValue(field, normalized[field], { shouldDirty: true });
      }
    }
  };

  const addGuest = (guest: GuestInput) => setGuests([...guests, guest]);

  const renderGuest = (guest: GuestInput, index: number) => (
    <button
      key={index}
      type="button"
      // The whole card opens the guest for editing
      className={cn(
        listRow,
        'items-start dark:bg-input/30 dark:hover:bg-input/60'
      )}
      onClick={() => setDialog({ index })}
    >
      {/* As tall as the name's first line, so the flag centres on it */}
      <span className="flex h-5 shrink-0 items-center">
        <CountryFlag code={guest.nationality_code} className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm wrap-anywhere">
          {guest.first_name} {guest.last_name}
        </span>
        {/* The email tells apart guests who share a name */}
        <span className="line-clamp-2 text-xs wrap-anywhere text-muted-foreground">
          {t(ageGroupLabel[guest.age_group])}
          {guest.email && ` · ${guest.email}`}
        </span>
      </span>
      {/* Only while hovered or focused: where the click leads */}
      <ChevronRightIcon
        className="size-4 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      />
      <span className="sr-only">
        <Trans>Edit guest</Trans>
      </span>
    </button>
  );

  const primaryIndex = guests.findIndex((guest) => guest.is_primary);
  const hasFreePlaces = places.some(({ free }) => free > 0);
  const editing = dialog && 'index' in dialog ? dialog.index : null;
  const editedGuest = editing === null ? undefined : guests[editing];

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup className="grid grid-cols-2 gap-4 2xl:grid-cols-4">
        {places.map(({ field: name, countLabel, min, named }) => (
          <Controller
            key={name}
            control={form.control}
            name={name}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor={field.name}>{t(countLabel)}</FieldLabel>
                <NumberInput
                  {...field}
                  id={field.name}
                  value={field.value}
                  // Never below the guests already named in the group
                  min={Math.max(min, named)}
                  onValueChange={(value) => field.onChange(value ?? 0)}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}
      </FieldGroup>

      <div className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground" aria-live="polite">
          <Trans>
            {guests.length} of {plannedTotal} guests registered
          </Trans>
        </div>

        {/* Two ways to add a guest: find a known one or enter a new one */}
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <GuestSearchCombobox
              currentGuests={guests}
              onSelectGuest={(found) =>
                // The search knows guests by name only
                addGuest({
                  ...found,
                  is_primary: false,
                  age_group: defaultAgeGroup(occupancy)
                })
              }
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={() => setDialog({ group: 'adult' })}
          >
            <PlusIcon aria-hidden="true" />
            <Trans>New Guest</Trans>
          </Button>
        </div>

        {primaryIndex !== -1 && (
          <>
            <h3 className={cn(listHeading, 'mt-2')}>
              <Trans>Primary guest</Trans>
            </h3>
            {guests.map(
              (guest, index) =>
                index === primaryIndex && renderGuest(guest, index)
            )}

            {/* Free places belong with the fellow travelers once someone is the primary guest */}
            {(guests.length > 1 || hasFreePlaces) && (
              <h3 className={cn(listHeading, 'mt-2')}>
                <Trans>Fellow travelers</Trans>
              </h3>
            )}
          </>
        )}
        {guests.map(
          (guest, index) => index !== primaryIndex && renderGuest(guest, index)
        )}

        {/* Places planned in the head counts that nobody is named for yet */}
        {places.map(
          ({ group, countLabel, free }) =>
            free > 0 && (
              <button
                key={group}
                type="button"
                className={cn(
                  listRow,
                  'items-center border-dashed text-sm text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setDialog({ group })}
              >
                <PlusIcon className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">
                  {t(countLabel)} · <Trans>{free} not registered</Trans>
                </span>
                <span className="sr-only">
                  <Trans>Add guest</Trans>
                </span>
              </button>
            )
        )}
      </div>

      {editedGuest && editing !== null && (
        <GuestDialog
          guest={editedGuest}
          onClose={() => setDialog(null)}
          onSave={(saved) =>
            setGuests(guests.map((g, index) => (index === editing ? saved : g)))
          }
          onRemove={() =>
            setGuests(guests.filter((_, index) => index !== editing))
          }
          onMakePrimary={
            editedGuest.is_primary
              ? undefined
              : () =>
                  setGuests(
                    guests.map((g, index) => ({
                      ...g,
                      is_primary: index === editing
                    }))
                  )
          }
        />
      )}

      {dialog && 'group' in dialog && (
        <GuestDialog
          guest={{
            first_name: '',
            last_name: '',
            email: null,
            nationality_code: '',
            is_primary: false,
            age_group: dialog.group
          }}
          onClose={() => setDialog(null)}
          onSave={addGuest}
        />
      )}
    </div>
  );
}
