import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import {
  type Guest,
  type GuestAgeGroup,
  guestAgeGroupSchema
} from 'shared/types/reservations';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
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

import { guestAgeGroupLabels } from './guest-age-group';

interface AddGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The group of the place being filled. */
  defaultAgeGroup: GuestAgeGroup;
  onAddGuest: (guest: Guest) => void;
}

const addGuestSchema = z.object({
  firstName: z.string().min(1, t`First name is required`),
  lastName: z.string().min(1, t`Last name is required`),
  email: z
    .email(t`Please enter a valid email address`)
    .optional()
    .or(z.literal('')),
  nationality_code: z.string().min(1, t`Nationality is required`),
  age_group: guestAgeGroupSchema
});

type AddGuestFormData = z.infer<typeof addGuestSchema>;

export function AddGuestModal({
  open,
  onOpenChange,
  defaultAgeGroup,
  onAddGuest
}: AddGuestModalProps) {
  const { i18n } = useLingui();

  const form = useForm<AddGuestFormData>({
    resolver: zodResolver(addGuestSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      nationality_code: '',
      age_group: defaultAgeGroup
    }
  });

  const onSubmit = (data: AddGuestFormData) => {
    const newGuest: Guest = {
      id: Date.now(),
      reservation_id: 0,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email || null,
      nationality_code: data.nationality_code,
      is_primary: false,
      age_group: data.age_group,
      created_at: new Date(),
      updated_at: null
    };

    onAddGuest(newGuest);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Add New Guest</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Changes apply once the reservation is saved.</Trans>
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-6"
        >
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit">
              <Trans>Add Guest</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
