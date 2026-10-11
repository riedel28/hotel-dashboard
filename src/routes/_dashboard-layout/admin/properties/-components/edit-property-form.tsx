import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

import { CustomerPicker } from './customer-picker';
import { NavItemsField } from './nav-items-field';
import { propertyOptionLabels, propertyOptions } from './property-options';

interface EditPropertyFormData {
  name: string;
  country_code: string;
  stage: Property['stage'];
  disabled_nav_items: NavItemId[];
  options: PropertyOption[];
  pwa_domain: string;
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
      options: propertyData.options,
      pwa_domain: propertyData.pwa_domain ?? '',
      customer: propertyData.customer
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
      submitLabel={<Trans>Update Property</Trans>}
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
        name="country_code"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>Country</Trans>
            </FieldLabel>
            <CountryPicker value={field.value} onValueChange={field.onChange} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
    <FieldGroup className="gap-4">
      <Controller
        control={form.control}
        name="options"
        render={({ field }) => (
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {propertyOptions.map((option) => (
              <Field key={option} orientation="horizontal" className="gap-2">
                <Checkbox
                  id={`option-${option}`}
                  checked={field.value.includes(option)}
                  onCheckedChange={(checked) =>
                    field.onChange(
                      // Catalog order, whatever the click order.
                      propertyOptions.filter((id) =>
                        id === option ? checked : field.value.includes(id)
                      )
                    )
                  }
                />
                <FieldLabel
                  htmlFor={`option-${option}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {t(propertyOptionLabels[option])}
                </FieldLabel>
              </Field>
            ))}
          </div>
        )}
      />

      {hasPwa && (
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
                    field.onChange(
                      event.target.value.replace(/^https?:\/\//i, '')
                    )
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
      )}
    </FieldGroup>
  );
}

const PROPERTY_FORM_SECTIONS: FormSectionDef<EditPropertyFormData>[] = [
  {
    id: 'general',
    label: <Trans>General</Trans>,
    description: (
      <Trans>
        What the property is called, where it is and how far along it is.
      </Trans>
    ),
    fields: ['name', 'country_code', 'stage'],
    render: (form) => <GeneralFields form={form} />
  },
  {
    id: 'customer',
    label: <Trans>Customer</Trans>,
    description: <Trans>Who owns this property.</Trans>,
    fields: ['customer'],
    render: (form) => (
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
    )
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
