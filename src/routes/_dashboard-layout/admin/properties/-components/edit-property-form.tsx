import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { NavItemId, Property } from 'shared/types/properties';
import { toast } from 'sonner';

import { updatePropertyById } from '@/api/properties';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
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
import { toggleableNavGroups } from '@/routes/_dashboard-layout/-components/nav-items';

interface EditPropertyFormData {
  name: string;
  country_code: string;
  stage: Property['stage'];
  disabled_nav_items: NavItemId[];
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
  const { t } = useLingui();

  const form = useForm<EditPropertyFormData>({
    values: {
      name: propertyData.name,
      country_code: propertyData.country_code,
      stage: propertyData.stage,
      disabled_nav_items: propertyData.disabled_nav_items
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

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans>Nav items</Trans>
          </CardTitle>
          <CardDescription>
            <Trans>
              Unchecked nav items are hidden from the navigation and the Start
              page for this property.
            </Trans>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="disabled_nav_items"
            render={({ field }) => (
              <div className="space-y-5">
                {toggleableNavGroups.map((group) => (
                  <FieldSet key={group.key} className="gap-3">
                    {group.label && (
                      <FieldLegend variant="label">
                        {t(group.label)}
                      </FieldLegend>
                    )}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {group.items.map(({ id, label }) => (
                        <Field
                          key={id}
                          orientation="horizontal"
                          className="gap-3 rounded-md border bg-muted/20 p-3"
                        >
                          <Checkbox
                            id={`nav-item-${id}`}
                            checked={!field.value.includes(id)}
                            onCheckedChange={(checked) =>
                              field.onChange(
                                checked
                                  ? field.value.filter((v) => v !== id)
                                  : [...field.value, id]
                              )
                            }
                          />
                          <FieldLabel
                            htmlFor={`nav-item-${id}`}
                            className="cursor-pointer text-sm font-normal"
                          >
                            {t(label)}
                          </FieldLabel>
                        </Field>
                      ))}
                    </div>
                  </FieldSet>
                ))}
              </div>
            )}
          />
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
