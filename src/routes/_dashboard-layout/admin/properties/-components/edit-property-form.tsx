import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { Property } from 'shared/types/properties';
import { toast } from 'sonner';
import { updatePropertyById } from '@/api/properties';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountryPicker } from '@/components/ui/country-picker';
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

interface EditPropertyFormData {
  name: string;
  country_code: string;
  stage: Property['stage'];
}

interface EditPropertyFormProps {
  propertyId: string;
  propertyData: Property;
}

export function EditPropertyForm({
  propertyId,
  propertyData
}: EditPropertyFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<EditPropertyFormData>({
    values: {
      name: propertyData.name,
      country_code: propertyData.country_code,
      stage: propertyData.stage
    }
  });

  const updatePropertyMutation = useMutation({
    mutationFn: (data: EditPropertyFormData) =>
      updatePropertyById(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
      toast.success(t`Property updated successfully`);
    },
    onError: (error) => {
      console.error('Failed to update property:', error);
      toast.error(t`Failed to update property. Please try again.`);
    }
  });

  const onSubmit = (data: EditPropertyFormData) => {
    updatePropertyMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans>Property Details</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldSet className="gap-4">
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Name</Trans>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={t`Enter property name`}
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
                name="country_code"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Country</Trans>
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
                name="stage"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Stage</Trans>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue>
                          {(value) =>
                            value ? (
                              <span className="capitalize">{value}</span>
                            ) : (
                              <span className="text-muted-foreground">
                                {t`Select stage`}
                              </span>
                            )
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">
                          <Trans>Production</Trans>
                        </SelectItem>
                        <SelectItem value="staging">
                          <Trans>Staging</Trans>
                        </SelectItem>
                        <SelectItem value="demo">
                          <Trans>Demo</Trans>
                        </SelectItem>
                        <SelectItem value="template">
                          <Trans>Template</Trans>
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
        </CardContent>
      </Card>

      <Button type="submit" disabled={updatePropertyMutation.isPending}>
        {updatePropertyMutation.isPending && (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        )}
        <Trans>Save Changes</Trans>
      </Button>
    </form>
  );
}
