import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import type { Guest } from 'shared/types/reservations';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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

interface EditGuestFormProps {
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedGuest: Guest) => void;
}

const editGuestSchema = z.object({
  firstName: z.string().min(1, t`First name is required`),
  lastName: z.string().min(1, t`Last name is required`),
  email: z
    .email(t`Please enter a valid email address`)
    .optional()
    .or(z.literal('')),
  nationality_code: z.enum(['DE', 'US', 'AT', 'CH'])
});

type EditGuestFormData = z.infer<typeof editGuestSchema>;

// Helper function to get form default values from guest data
function getGuestFormDefaults(guest: Guest): EditGuestFormData {
  return {
    firstName: guest.first_name,
    lastName: guest.last_name,
    email: guest.email || '',
    nationality_code: guest.nationality_code
  };
}

export function EditGuestForm({
  guest,
  open,
  onOpenChange,
  onSave
}: EditGuestFormProps) {
  const formDefaults = getGuestFormDefaults(guest);
  const form = useForm<EditGuestFormData>({
    resolver: zodResolver(editGuestSchema),
    defaultValues: formDefaults,
    values: formDefaults
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
      updated_at: new Date()
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Trans>Edit Guest</Trans>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldSet className="gap-4">
            <FieldGroup className="gap-4">
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
                  <Field data-invalid={fieldState.invalid} className="gap-2">
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue>
                          {(value) => {
                            const nationalityMap: Record<string, string> = {
                              DE: t`Germany`,
                              US: t`United States`,
                              AT: t`Austria`,
                              CH: t`Switzerland`
                            };
                            return value ? (
                              <span>{nationalityMap[value] || value}</span>
                            ) : (
                              <span className="text-muted-foreground">
                                {t`Select nationality`}
                              </span>
                            );
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DE">
                          <Trans>Germany</Trans>
                        </SelectItem>
                        <SelectItem value="US">
                          <Trans>United States</Trans>
                        </SelectItem>
                        <SelectItem value="AT">
                          <Trans>Austria</Trans>
                        </SelectItem>
                        <SelectItem value="CH">
                          <Trans>Switzerland</Trans>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
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
              <Trans>Save Changes</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
