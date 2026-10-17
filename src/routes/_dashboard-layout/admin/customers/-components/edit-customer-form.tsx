import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from '@tanstack/react-router';
import { useMemo } from 'react';
import type { Customer } from 'shared/types/customers';
import { toast } from 'sonner';

import { updateCustomerById } from '@/api/customers';
import {
  type FormSectionDef,
  SectionedForm
} from '@/components/sectioned-form';
import { CountryFlag } from '@/components/ui/country-flag';
import { StageBadge } from '@/components/ui/stage-badge';

import {
  CustomerAddressFields,
  CustomerContactFields,
  type CustomerFormValues,
  showEmailTakenError,
  useCustomerForm
} from './customer-fields';

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const queryClient = useQueryClient();
  const { t } = useLingui();

  const form = useCustomerForm({
    first_name: customer.first_name,
    last_name: customer.last_name,
    company_name: customer.company_name ?? '',
    email: customer.email,
    address_line_1: customer.address_line_1,
    address_line_2: customer.address_line_2 ?? '',
    zip: customer.zip,
    city: customer.city,
    country_code: customer.country_code
  });

  const updateCustomerMutation = useMutation({
    mutationFn: (data: CustomerFormValues) =>
      updateCustomerById(customer.id, data),
    onSuccess: () => {
      // The Customer's name is also shown on its Properties.
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(t`Customer updated successfully`);
    },
    onError: (error) => {
      if (showEmailTakenError(form, error)) return;
      toast.error(t`Failed to update customer. Please try again.`);
    }
  });

  const sections = useMemo(() => customerSections(customer), [customer]);

  return (
    <SectionedForm
      form={form}
      sections={sections}
      onSubmit={(data) => updateCustomerMutation.mutate(data)}
      isSaving={updateCustomerMutation.isPending}
      submitLabel={<Trans>Save changes</Trans>}
    />
  );
}

/** The properties a customer owns, each linking to its page. */
function CustomerProperties({ customer }: { customer: Customer }) {
  return customer.properties.length === 0 ? (
    <p className="text-sm text-muted-foreground">
      <Trans>No properties yet.</Trans>
    </p>
  ) : (
    <ul className="divide-y divide-border">
      {customer.properties.map((property) => (
        <li
          key={property.id}
          className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
        >
          <CountryFlag
            code={property.country_code}
            title={property.country_code}
            className="size-4 shrink-0"
            aria-label={property.country_code}
          />
          <RouterLink
            to="/admin/properties/$propertyId"
            params={{ propertyId: property.id }}
            className="min-w-0 flex-1 truncate text-link underline-offset-4 hover:underline"
          >
            {property.name}
          </RouterLink>
          <StageBadge stage={property.stage} size="sm" />
        </li>
      ))}
    </ul>
  );
}

const customerSections = (
  customer: Customer
): FormSectionDef<CustomerFormValues>[] => [
  {
    id: 'contact',
    label: <Trans>Contact</Trans>,
    description: (
      <Trans>The person we deal with, and the company they act for.</Trans>
    ),
    fields: ['first_name', 'last_name', 'company_name', 'email'],
    render: (form) => <CustomerContactFields control={form.control} />
  },
  {
    id: 'address',
    label: <Trans>Address</Trans>,
    description: <Trans>Where the customer is registered.</Trans>,
    fields: ['address_line_1', 'address_line_2', 'zip', 'city', 'country_code'],
    render: (form) => <CustomerAddressFields control={form.control} />
  },
  {
    id: 'properties',
    label: <Trans>Properties</Trans>,
    description: (
      <Trans>
        The properties this customer owns. Change the owner on a property's
        page.
      </Trans>
    ),
    render: () => <CustomerProperties customer={customer} />
  }
];
