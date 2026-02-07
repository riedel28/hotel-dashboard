import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function PersonalSection() {
  const personalFormSchema = z.object({
    firstName: z.string().min(1, t`First name is required`),
    lastName: z.string().min(1, t`Last name is required`),
    email: z.email(t`Invalid email address`)
  });

  type PersonalFormData = z.infer<typeof personalFormSchema>;

  const form = useForm<PersonalFormData>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: ''
    }
  });

  const onSubmit = async (_data: PersonalFormData) => {
    // TODO: Implement API call to update personal information
    toast.warning(t`Profile update is not yet implemented`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans>Personal Information</Trans>
          </CardTitle>
          <CardDescription>
            <Trans>Update your personal information and contact details</Trans>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldSet className="gap-4">
              <FieldGroup className="gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-2"
                      >
                        <FieldLabel htmlFor={field.name}>
                          <Trans>First Name</Trans>
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          placeholder={t`Enter first name`}
                          autoComplete="given-name"
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
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-2"
                      >
                        <FieldLabel htmlFor={field.name}>
                          <Trans>Last Name</Trans>
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          placeholder={t`Enter last name`}
                          autoComplete="family-name"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

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
                        placeholder={t`Enter your email`}
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Trans>Save Changes</Trans>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
