import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from '@tanstack/react-router';
import { Loader2Icon } from 'lucide-react';
import type { CustomerDetail } from 'shared/types/customers';
import { toast } from 'sonner';

import { updateCustomerById } from '@/api/customers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountryFlag } from '@/components/ui/country-flag';
import { StageBadge } from '@/components/ui/stage-badge';

import {
  CustomerFields,
  type CustomerFormValues,
  showEmailTakenError,
  useCustomerForm
} from './customer-fields';

export function EditCustomerForm({ customer }: { customer: CustomerDetail }) {
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
      if (
        showEmailTakenError(
          form,
          error,
          t`A customer with this email already exists`
        )
      ) {
        return;
      }
      toast.error(t`Failed to update customer. Please try again.`);
    }
  });

  return (
    <div className="max-w-xl space-y-6">
      <form
        onSubmit={form.handleSubmit((data) =>
          updateCustomerMutation.mutate(data)
        )}
        className="space-y-6"
        noValidate
      >
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans>Customer Details</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerFields control={form.control} />
          </CardContent>
        </Card>

        <Button type="submit" disabled={updateCustomerMutation.isPending}>
          {updateCustomerMutation.isPending && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Trans>Save Changes</Trans>
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans>Properties</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.properties.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              <Trans>
                No properties yet. Assign this customer on a property's page.
              </Trans>
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
                    className="min-w-0 flex-1 truncate font-medium underline-offset-4 hover:underline"
                  >
                    {property.name}
                  </RouterLink>
                  <StageBadge stage={property.stage} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
