import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { ChevronDownIcon, StarIcon, UserMinusIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import {
  type Guest,
  type GuestAgeGroup,
  guestAgeGroupSchema
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

import { guestAgeGroupLabels } from './guest-age-group';

interface EditGuestFormProps {
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedGuest: Guest) => void;
  /** Takes the guest off this reservation; the guest record is not deleted. */
  onRemove: () => void;
  /** Hands the primary flag to this guest. */
  onMakePrimary: () => void;
}

const editGuestSchema = z.object({
  firstName: z.string().min(1, t`First name is required`),
  lastName: z.string().min(1, t`Last name is required`),
  email: z
    .email(t`Please enter a valid email address`)
    .optional()
    .or(z.literal('')),
  nationality_code: z.string().min(1, t`Nationality is required`),
  age_group: guestAgeGroupSchema
});

type EditGuestFormData = z.infer<typeof editGuestSchema>;

// Helper function to get form default values from guest data
function getGuestFormDefaults(guest: Guest): EditGuestFormData {
  return {
    firstName: guest.first_name,
    lastName: guest.last_name,
    email: guest.email || '',
    nationality_code: guest.nationality_code,
    age_group: guest.age_group
  };
}

export function EditGuestForm({
  guest,
  open,
  onOpenChange,
  onSave,
  onRemove,
  onMakePrimary
}: EditGuestFormProps) {
  const { i18n } = useLingui();
  const form = useForm<EditGuestFormData>({
    resolver: zodResolver(editGuestSchema),
    defaultValues: getGuestFormDefaults(guest)
  });

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      form.reset(getGuestFormDefaults(guest));
    }
  };

  const onSubmit = (data: EditGuestFormData) => {
    onSave({
      ...guest,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email || null,
      nationality_code: data.nationality_code,
      age_group: data.age_group,
      updated_at: new Date()
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Edit Guest</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Changes apply once the reservation is saved.</Trans>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldSet className="gap-4">
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="firstName"
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
                name="lastName"
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
                      placeholder={t`Enter email address`}
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
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Nationality</Trans>
                    </FieldLabel>
                    <CountryPicker
                      value={field.value}
                      onValueChange={field.onChange}
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
                          {(value: GuestAgeGroup) =>
                            i18n._(guestAgeGroupLabels[value])
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {guestAgeGroupSchema.options.map((group) => (
                          <SelectItem key={group} value={group}>
                            {i18n._(guestAgeGroupLabels[group])}
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
            {guest.is_primary ? (
              // Nothing to promote, so removing is the only action here
              <Button
                type="button"
                variant="outline"
                // An ordinary button until hovered, then tinted like a soft destructive one
                className="hover:border-destructive/20 hover:bg-destructive/10 hover:text-danger focus-visible:border-destructive/20 focus-visible:bg-destructive/10 focus-visible:text-danger dark:hover:border-destructive/20 dark:hover:bg-destructive/20"
                onClick={() => {
                  onRemove();
                  onOpenChange(false);
                }}
              >
                <UserMinusIcon aria-hidden="true" />
                <Trans>Remove from reservation</Trans>
              </Button>
            ) : (
              // A split button: the main action, with the rarer one behind the arrow
              <div className="flex">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-r-none"
                  onClick={() => {
                    onMakePrimary();
                    onOpenChange(false);
                  }}
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
                      onClick={() => {
                        onRemove();
                        onOpenChange(false);
                      }}
                    >
                      <UserMinusIcon />
                      <Trans>Remove from reservation</Trans>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {/* Pushes Cancel and Update to the right */}
            <span className="hidden flex-1 sm:block" />
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit">
              <Trans>Update</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
