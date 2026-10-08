import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from '@tanstack/react-router';
import { Loader2Icon } from 'lucide-react';
import type { ReactNode } from 'react';
import { type CustomerDetail, customerLabel } from 'shared/types/customers';
import { toast } from 'sonner';

import { updateCustomerById } from '@/api/customers';
import { SectionHeading } from '@/components/section-heading';
import {
  type NavSection,
  sectionHeadingId,
  SectionNav
} from '@/components/section-nav';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { CountryFlag } from '@/components/ui/country-flag';
import { Separator } from '@/components/ui/separator';
import { StageBadge } from '@/components/ui/stage-badge';

import {
  CustomerAddressFields,
  CustomerContactFields,
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

  const isDirty = form.formState.isDirty;

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

  const isSaving = updateCustomerMutation.isPending;

  return (
    <div className="flex flex-row gap-8">
      <SectionNav
        sections={CUSTOMER_FORM_SECTIONS}
        className="order-2 hidden xl:block"
      />

      <Card className="relative max-w-4xl min-w-0 flex-1 overflow-visible">
        <CardHeader>
          <CardTitle>{customerLabel(customer)}</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            id="customer-form"
            onSubmit={form.handleSubmit((data) =>
              updateCustomerMutation.mutate(data)
            )}
            aria-busy={isSaving}
            className="flex flex-col gap-6 md:gap-8"
            noValidate
          >
            <fieldset disabled={isSaving} className="contents">
              <FormSection
                id="contact"
                title={<Trans>Contact</Trans>}
                description={
                  <Trans>
                    The person we deal with, and the company they act for.
                  </Trans>
                }
              >
                <CustomerContactFields control={form.control} />
              </FormSection>

              <Separator />

              <FormSection
                id="address"
                title={<Trans>Address</Trans>}
                description={<Trans>Where the customer is registered.</Trans>}
              >
                <CustomerAddressFields control={form.control} />
              </FormSection>
            </fieldset>

            <Separator />

            <FormSection
              id="properties"
              title={<Trans>Properties</Trans>}
              description={
                <Trans>
                  The properties this customer owns. Change the owner on a
                  property's page.
                </Trans>
              }
            >
              {customer.properties.length === 0 ? (
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
                        className="min-w-0 flex-1 truncate font-medium underline-offset-4 hover:underline"
                      >
                        {property.name}
                      </RouterLink>
                      <StageBadge stage={property.stage} size="sm" />
                    </li>
                  ))}
                </ul>
              )}
            </FormSection>
          </form>
        </CardContent>

        {/* Sticky action bar. The negative bottom offset matches the scroll
          container's bottom padding (main: pb-4 / md:pb-8) so the bar sits
          flush against the very bottom of the viewport, not above the padding. */}
        <CardFooter className="sticky -bottom-4 z-10 -mb-6 rounded-b-xl border-t border-border/60 bg-card/80 py-4! backdrop-blur md:-bottom-8">
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
              <Button type="submit" form="customer-form" disabled={isSaving}>
                {isSaving && (
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                )}
                <Trans>Save changes</Trans>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Single source of truth for the page's sections: the form renders one
 * `<section>` per entry and the table of contents links to them by id.
 */
const CUSTOMER_FORM_SECTIONS: NavSection[] = [
  { id: 'contact', label: <Trans>Contact</Trans> },
  { id: 'address', label: <Trans>Address</Trans> },
  { id: 'properties', label: <Trans>Properties</Trans> }
];

function FormSection({
  id,
  title,
  description,
  children
}: {
  id: string;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={sectionHeadingId(id)}
      className="grid scroll-mt-4 grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]"
    >
      <SectionHeading
        id={sectionHeadingId(id)}
        title={title}
        description={description}
      />
      <div>{children}</div>
    </section>
  );
}
