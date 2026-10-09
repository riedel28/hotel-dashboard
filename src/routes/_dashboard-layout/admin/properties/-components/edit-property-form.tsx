import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type {
  NavItemId,
  Property,
  PropertyCustomer
} from 'shared/types/properties';
import { toast } from 'sonner';

import { updatePropertyById } from '@/api/properties';
import { FormSection } from '@/components/form-section';
import { type NavSection, SectionNav } from '@/components/section-nav';
import { StickyCardFooter } from '@/components/sticky-card-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { CustomerPicker } from './customer-picker';
import { NavItemsField } from './nav-items-field';

interface EditPropertyFormData {
  name: string;
  country_code: string;
  stage: Property['stage'];
  disabled_nav_items: NavItemId[];
  customer: PropertyCustomer | null;
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
      disabled_nav_items: propertyData.disabled_nav_items,
      customer: propertyData.customer
    }
  });

  const updatePropertyMutation = useMutation({
    mutationFn: ({ customer, ...data }: EditPropertyFormData) =>
      updatePropertyById(propertyId, {
        ...data,
        customer_id: customer?.id ?? null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
      // Their property counts and lists changed too.
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(t`Property updated successfully`);
    },
    onError: (error) => {
      console.error('Failed to update property:', error);
      toast.error(t`Failed to update property. Please try again.`);
    }
  });

  const isDirty = form.formState.isDirty;
  const isSaving = updatePropertyMutation.isPending;

  return (
    <div className="flex flex-row gap-8">
      <SectionNav
        sections={PROPERTY_FORM_SECTIONS}
        className="order-2 hidden xl:block"
      />

      <Card className="relative max-w-4xl min-w-0 flex-1 overflow-visible">
        <CardContent>
          <form
            id="property-form"
            onSubmit={form.handleSubmit((data) =>
              updatePropertyMutation.mutate(data)
            )}
            aria-busy={isSaving}
            className="flex flex-col gap-6 md:gap-8"
            noValidate
          >
            <fieldset disabled={isSaving} className="contents">
              <FormSection
                id="general"
                title={<Trans>General</Trans>}
                description={
                  <Trans>
                    What the property is called, where it is and how far along
                    it is.
                  </Trans>
                }
              >
                <FieldGroup className="gap-4">
                  <Controller
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-2"
                      >
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
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-2"
                      >
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
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-2"
                      >
                        <FieldLabel htmlFor={field.name}>
                          <Trans>Stage</Trans>
                        </FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
              </FormSection>

              <Separator />

              <FormSection
                id="customer"
                title={<Trans>Customer</Trans>}
                description={<Trans>Who owns this property.</Trans>}
              >
                <Controller
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <Field className="gap-2">
                      <FieldLabel id="property-customer-label">
                        <Trans>Customer</Trans>
                      </FieldLabel>
                      <CustomerPicker
                        value={field.value}
                        onValueChange={field.onChange}
                        aria-labelledby="property-customer-label"
                      />
                    </Field>
                  )}
                />
              </FormSection>

              <Separator />

              <FormSection
                id="nav-items"
                title={<Trans>Nav items</Trans>}
                description={
                  <Trans>
                    Unchecked nav items are hidden from the navigation and the
                    Start page for this property.
                  </Trans>
                }
              >
                <Controller
                  control={form.control}
                  name="disabled_nav_items"
                  render={({ field }) => (
                    <NavItemsField
                      disabled={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormSection>
            </fieldset>
          </form>
        </CardContent>

        <StickyCardFooter>
          <div className="flex w-full flex-wrap items-center justify-end gap-3">
            <div
              className="mr-auto min-w-0 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {isSaving ? (
                <Trans>Saving changes…</Trans>
              ) : isDirty ? null : (
                <Trans>No unsaved changes</Trans>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={!isDirty || isSaving}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button type="submit" form="property-form" disabled={isSaving}>
                {isSaving && (
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                )}
                <Trans>Update Property</Trans>
              </Button>
            </div>
          </div>
        </StickyCardFooter>
      </Card>
    </div>
  );
}

/**
 * Single source of truth for the page's sections: the form renders one
 * `<section>` per entry and the table of contents links to them by id.
 */
const PROPERTY_FORM_SECTIONS: NavSection[] = [
  { id: 'general', label: <Trans>General</Trans> },
  { id: 'customer', label: <Trans>Customer</Trans> },
  { id: 'nav-items', label: <Trans>Nav items</Trans> }
];
