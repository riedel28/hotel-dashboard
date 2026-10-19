import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type * as React from 'react';
import { Controller, useForm, type UseFormReturn } from 'react-hook-form';
import {
  type NavItemId,
  type Property,
  type PropertyCustomer,
  type PropertyOption,
  pwaDomainSchema
} from 'shared/types/properties';
import { toast } from 'sonner';

import { updatePropertyById } from '@/api/properties';
import {
  type FormSectionDef,
  SectionedForm
} from '@/components/sectioned-form';
import { Checkbox } from '@/components/ui/checkbox';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  type PropertyStage,
  propertyStages,
  stageLabels
} from '@/components/ui/stage-badge';

import { CustomerPicker } from './customer-picker';
import { NavItemsField } from './nav-items-field';
import { propertyOptionGroups, propertyOptions } from './property-options';
import { TimezonePicker } from './timezone-picker';

interface EditPropertyFormData {
  name: string;
  country_code: string;
  stage: Property['stage'];
  disabled_nav_items: NavItemId[];
  options: PropertyOption[];
  pwa_domain: string;
  customer: PropertyCustomer | null;
  address_line_1: string;
  address_line_2: string;
  zip: string;
  city: string;
  timezone: string;
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
      options: propertyData.options,
      pwa_domain: propertyData.pwa_domain ?? '',
      customer: propertyData.customer,
      address_line_1: propertyData.address_line_1 ?? '',
      address_line_2: propertyData.address_line_2 ?? '',
      zip: propertyData.zip ?? '',
      city: propertyData.city ?? '',
      timezone: propertyData.timezone
    }
  });

  const updatePropertyMutation = useMutation({
    mutationFn: ({ customer, pwa_domain, ...data }: EditPropertyFormData) =>
      updatePropertyById(propertyId, {
        ...data,
        // The field keeps its text while PWA is unchecked, the server doesn't.
        pwa_domain: data.options.includes('mobile_app_pwa') ? pwa_domain : null,
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

  return (
    <SectionedForm
      form={form}
      sections={PROPERTY_FORM_SECTIONS}
      onSubmit={(data) => updatePropertyMutation.mutate(data)}
      isSaving={updatePropertyMutation.isPending}
      submitLabel={<Trans>Save changes</Trans>}
    />
  );
}

interface PropertyFieldsProps {
  form: UseFormReturn<EditPropertyFormData>;
}

function GeneralFields({ form }: PropertyFieldsProps) {
  const { t } = useLingui();

  return (
    <FieldGroup className="gap-4">
      <Controller
        control={form.control}
        name="name"
        rules={{ validate: (value) => !!value.trim() || t`Name is required` }}
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
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

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

      <Controller
        control={form.control}
        name="timezone"
        render={({ field }) => (
          <Field className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>Timezone</Trans>
            </FieldLabel>
            <TimezonePicker
              id={field.name}
              value={field.value}
              onValueChange={field.onChange}
            />
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
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue>
                  {(value: PropertyStage) => t(stageLabels[value])}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {propertyStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {t(stageLabels[stage])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}

function AddressFields({ form }: PropertyFieldsProps) {
  const { t } = useLingui();
  const text = (
    name: 'address_line_1' | 'address_line_2' | 'zip' | 'city',
    label: React.ReactNode,
    autoComplete: string
  ) => (
    <Field className="gap-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input id={name} autoComplete={autoComplete} {...form.register(name)} />
    </Field>
  );

  return (
    <FieldGroup className="gap-4">
      {text('address_line_1', <Trans>Street</Trans>, 'address-line1')}
      {text('address_line_2', <Trans>Address line 2</Trans>, 'address-line2')}
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {text('zip', <Trans>ZIP code</Trans>, 'postal-code')}
        {text('city', <Trans>City</Trans>, 'address-level2')}
      </div>
      <Controller
        control={form.control}
        name="country_code"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel id="property-country-label">
              <Trans>Country</Trans>
            </FieldLabel>
            <CountryPicker
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t`Select country`}
              aria-labelledby="property-country-label"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}

function SolutionsFields({ form }: PropertyFieldsProps) {
  const { t } = useLingui();
  const hasPwa = form.watch('options').includes('mobile_app_pwa');

  return (
    <Controller
      control={form.control}
      name="options"
      render={({ field }) => {
        const setChecked = (ids: PropertyOption[], checked: boolean) =>
          field.onChange(
            // Catalog order, whatever the click order.
            propertyOptions.filter((id) =>
              ids.includes(id) ? checked : field.value.includes(id)
            )
          );

        return (
          <div className="flex flex-col gap-5">
            {propertyOptionGroups.map((group) => {
              const ids = group.options.map((option) => option.id);
              const checkedCount = ids.filter((id) =>
                field.value.includes(id)
              ).length;

              const items = (
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  {group.options.map((option) => (
                    <Field
                      key={option.id}
                      orientation="horizontal"
                      className="gap-2"
                    >
                      <Checkbox
                        id={`option-${option.id}`}
                        checked={field.value.includes(option.id)}
                        onCheckedChange={(checked) =>
                          setChecked([option.id], checked)
                        }
                      />
                      <FieldLabel
                        htmlFor={`option-${option.id}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {t(option.label)}
                      </FieldLabel>
                    </Field>
                  ))}
                </div>
              );

              if (!group.label) return <div key={group.key}>{items}</div>;

              const groupId = `option-group-${group.key}`;

              return (
                <div
                  key={group.key}
                  role="group"
                  aria-labelledby={`${groupId}-label`}
                  className="flex flex-col gap-3"
                >
                  <Field orientation="horizontal" className="gap-2">
                    <Checkbox
                      id={groupId}
                      checked={checkedCount === ids.length}
                      indeterminate={
                        checkedCount > 0 && checkedCount < ids.length
                      }
                      onCheckedChange={(checked) => setChecked(ids, checked)}
                    />
                    <FieldLabel
                      id={`${groupId}-label`}
                      htmlFor={groupId}
                      className="cursor-pointer text-sm font-medium"
                    >
                      {t(group.label)}
                    </FieldLabel>
                  </Field>
                  <div className="flex flex-col gap-3 pl-6">
                    {items}
                    {/* The PWA's domain right under it */}
                    {group.key === 'mobile-app' && hasPwa && (
                      <PwaDomainField form={form} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }}
    />
  );
}

function PwaDomainField({ form }: PropertyFieldsProps) {
  const { t } = useLingui();

  return (
    <Controller
      control={form.control}
      name="pwa_domain"
      rules={{
        validate: (value) =>
          !value.trim()
            ? t`PWA domain is required`
            : pwaDomainSchema.safeParse(value).success ||
              t`Enter a domain without a path, e.g. app.example.com`
      }}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
          <FieldLabel htmlFor={field.name}>
            <Trans>PWA Domain</Trans>
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              {...field}
              // The protocol is already shown: drop a pasted one.
              onChange={(event) =>
                field.onChange(event.target.value.replace(/^https?:\/\//i, ''))
              }
              id={field.name}
              placeholder="app.example.com"
              inputMode="url"
              autoCapitalize="none"
              spellCheck={false}
              required
              aria-invalid={fieldState.invalid}
            />
          </InputGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

const PROPERTY_FORM_SECTIONS: FormSectionDef<EditPropertyFormData>[] = [
  {
    id: 'general',
    label: <Trans>General</Trans>,
    description: (
      <Trans>
        What the property is called, who owns it, its timezone and how far along
        it is.
      </Trans>
    ),
    fields: ['name', 'customer', 'timezone', 'stage'],
    render: (form) => <GeneralFields form={form} />
  },
  {
    id: 'address',
    label: <Trans>Address</Trans>,
    description: (
      <Trans>Where the hotel is. Forms such as events can fill it in.</Trans>
    ),
    fields: ['address_line_1', 'address_line_2', 'zip', 'city', 'country_code'],
    render: (form) => <AddressFields form={form} />
  },
  {
    id: 'solutions',
    label: <Trans>Solutions</Trans>,
    description: <Trans>What this property has booked.</Trans>,
    fields: ['options', 'pwa_domain'],
    render: (form) => <SolutionsFields form={form} />
  },
  {
    id: 'nav-items',
    label: <Trans>Nav items</Trans>,
    description: (
      <Trans>
        Unchecked nav items are hidden from the navigation and the Start page
        for this property.
      </Trans>
    ),
    fields: ['disabled_nav_items'],
    render: (form) => (
      <Controller
        control={form.control}
        name="disabled_nav_items"
        render={({ field }) => (
          <NavItemsField disabled={field.value} onChange={field.onChange} />
        )}
      />
    )
  }
];
