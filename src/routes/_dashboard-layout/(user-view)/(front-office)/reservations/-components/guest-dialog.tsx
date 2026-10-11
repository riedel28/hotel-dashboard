import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { ChevronDownIcon, StarIcon, UserMinusIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import {
  type GuestAgeGroup,
  guestAgeGroupSchema,
  type GuestInput
} from 'shared/types/reservations';
import { z } from 'zod';

import { Button, buttonVariants } from '@/components/ui/button';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { AGE_GROUPS, ageGroupLabel } from '../-lib/age-groups';

interface GuestDialogProps {
  /** The guest to edit, or the blank one being added. */
  guest: GuestInput;
  onClose: () => void;
  onSave: (guest: GuestInput) => void;
  /**
   * Given for a guest already on the reservation. Takes them off it; the
   * guest is not deleted anywhere else.
   */
  onRemove?: () => void;
  /** Hands the primary flag to this guest. */
  onMakePrimary?: () => void;
}

/**
 * Adds or edits one guest of a reservation. Adding is editing a blank guest:
 * the caller decides what saving means and mounts the dialog while it is open.
 */
export function GuestDialog({
  guest,
  onClose,
  onSave,
  onRemove,
  onMakePrimary
}: GuestDialogProps) {
  const { t } = useLingui();
  const isNew = !onRemove;

  const form = useForm({
    resolver: zodResolver(
      z.object({
        first_name: z
          .string()
          .trim()
          .min(1, t`First name is required`),
        last_name: z
          .string()
          .trim()
          .min(1, t`Last name is required`),
        email: z.union([
          z.literal(''),
          z.email(t`Please enter a valid email address`)
        ]),
        nationality_code: z.string().min(1, t`Nationality is required`),
        age_group: guestAgeGroupSchema
      })
    ),
    defaultValues: { ...guest, email: guest.email ?? '' }
  });

  // Each action closes the dialog once it is done
  const closeAfter = (action: () => void) => () => {
    action();
    onClose();
  };

  const removeItem = (
    <>
      <UserMinusIcon aria-hidden="true" />
      <Trans>Remove from reservation</Trans>
    </>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isNew ? <Trans>Add New Guest</Trans> : <Trans>Edit Guest</Trans>}
          </DialogTitle>
          <DialogDescription>
            <Trans>Changes apply once the reservation is saved.</Trans>
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            // The dialog is rendered inside the reservation form
            event.stopPropagation();
            void form.handleSubmit((data) => {
              onSave({ ...guest, ...data, email: data.email || null });
              onClose();
            })(event);
          }}
          className="space-y-6"
        >
          <FieldSet className="gap-4">
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="first_name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>First Name</Trans>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={t`Enter first name`}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="last_name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Last Name</Trans>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={t`Enter last name`}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-2 sm:col-span-2"
                  >
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Email</Trans>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      placeholder={t`Enter email`}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="nationality_code"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel>
                      <Trans>Nationality</Trans>
                    </FieldLabel>
                    <CountryPicker
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? '')}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="age_group"
                render={({ field }) => (
                  <Field className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Age group</Trans>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue>
                          {(value: GuestAgeGroup) => t(ageGroupLabel[value])}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {AGE_GROUPS.map(({ group, label }) => (
                          <SelectItem key={group} value={group}>
                            {t(label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <DialogFooter className="flex-wrap sm:items-center">
            {onRemove && onMakePrimary && (
              // A split button: the main action, with the rarer one behind the arrow
              <div className="flex">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-r-none"
                  onClick={closeAfter(onMakePrimary)}
                >
                  <StarIcon aria-hidden="true" />
                  <Trans>Make primary</Trans>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={t`More actions`}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'icon-lg' }),
                      '-ml-px w-8 rounded-l-none'
                    )}
                  >
                    <ChevronDownIcon aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto min-w-0">
                    <DropdownMenuItem
                      variant="destructive-soft"
                      className="gap-2"
                      onClick={closeAfter(onRemove)}
                    >
                      {removeItem}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {onRemove && !onMakePrimary && (
              // Nothing to promote, so removing is the only action here
              <Button
                type="button"
                variant="outline"
                // An ordinary button until hovered, then tinted like a soft destructive one
                className="hover:border-destructive/20 hover:bg-destructive/10 hover:text-danger focus-visible:border-destructive/20 focus-visible:bg-destructive/10 focus-visible:text-danger dark:hover:border-destructive/20 dark:hover:bg-destructive/20"
                onClick={closeAfter(onRemove)}
              >
                {removeItem}
              </Button>
            )}
            {/* Pushes Cancel and the submit button to the right */}
            <span className="hidden flex-1 sm:block" />
            <Button type="button" variant="outline" onClick={onClose}>
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit">
              {isNew ? <Trans>Add Guest</Trans> : <Trans>Update</Trans>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
