import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from '@tanstack/react-router';
import { Loader2Icon, PenSquareIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { type CustomerDetail, customerLabel } from 'shared/types/customers';
import { toast } from 'sonner';

import { customerByIdQueryOptions, updateCustomerById } from '@/api/customers';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { CountryFlag } from '@/components/ui/country-flag';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { StageBadge } from '@/components/ui/stage-badge';
import { getCountryName } from '@/lib/countries';

import {
  CustomerFields,
  type CustomerFormValues,
  showEmailTakenError,
  useCustomerForm
} from './customer-fields';

interface CustomerDetailsDrawerProps {
  /** The Customer to show; the drawer is closed without one. */
  customerId: string | undefined;
  onClose: () => void;
}

/** A Customer, read-only until Edit turns the same drawer into its form. */
export function CustomerDetailsDrawer({
  customerId,
  onClose
}: CustomerDetailsDrawerProps) {
  return (
    <Drawer
      open={customerId !== undefined}
      onOpenChange={(next) => !next && onClose()}
    >
      <DrawerContent>
        {customerId && (
          // Keyed, so another Customer always starts in the read-only view
          <CustomerDrawerContent key={customerId} customerId={customerId} />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function CustomerDrawerContent({ customerId }: { customerId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: customer, isPending } = useQuery({
    ...customerByIdQueryOptions(customerId),
    retry: false
  });

  if (isPending) {
    return (
      <>
        <DrawerHeader>
          <DrawerTitle className="pr-10">
            <Skeleton className="h-6 w-48" />
          </DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="space-y-3">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-5 w-72" />
        </DrawerBody>
      </>
    );
  }

  if (!customer) {
    return (
      <DrawerHeader className="space-y-1 pr-14">
        <DrawerTitle>
          <Trans>Customer not found</Trans>
        </DrawerTitle>
        <p className="text-sm font-normal text-muted-foreground">
          <Trans>This customer does not exist or could not be loaded.</Trans>
        </p>
      </DrawerHeader>
    );
  }

  return isEditing ? (
    <CustomerEdit customer={customer} onDone={() => setIsEditing(false)} />
  ) : (
    <CustomerView customer={customer} onEdit={() => setIsEditing(true)} />
  );
}

function Detail({
  label,
  children
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <dt className="self-start py-1 text-muted-foreground">{label}</dt>
      <dd className="flex min-h-7 items-center">{children}</dd>
    </>
  );
}

const none = <span className="text-muted-foreground">—</span>;

function CustomerView({
  customer,
  onEdit
}: {
  customer: CustomerDetail;
  onEdit: () => void;
}) {
  const { t, i18n } = useLingui();
  const name = `${customer.first_name} ${customer.last_name}`;

  return (
    <>
      <DrawerHeader className="space-y-1">
        {/* Only the title row shares its line with the close button */}
        <DrawerTitle className="pr-10">{customerLabel(customer)}</DrawerTitle>
        {customer.company_name && (
          <p className="text-sm font-normal text-muted-foreground">{name}</p>
        )}
      </DrawerHeader>

      <DrawerBody className="space-y-6">
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-10 gap-y-3 text-sm">
          <Detail label={<Trans>Name</Trans>}>{name}</Detail>
          <Detail label={<Trans>Company</Trans>}>
            {customer.company_name || none}
          </Detail>
          <Detail label={<Trans>Email</Trans>}>
            <span className="break-all">{customer.email}</span>
            <CopyButton
              text={customer.email}
              copyLabel={t`Copy email`}
              copiedLabel={t`Email copied`}
              buttonClassName="ml-1"
            />
          </Detail>
          <Detail label={<Trans>Address</Trans>}>
            <div className="space-y-0.5 py-1">
              <div>{customer.address_line_1}</div>
              {customer.address_line_2 && <div>{customer.address_line_2}</div>}
              <div>
                {customer.zip} {customer.city}
              </div>
            </div>
          </Detail>
          <Detail label={<Trans>Country</Trans>}>
            <CountryFlag
              code={customer.country_code}
              title={customer.country_code}
              className="mr-2 size-4 shrink-0"
              aria-label={customer.country_code}
            />
            {getCountryName(customer.country_code, i18n.locale)}
          </Detail>
        </dl>

        <section className="space-y-2 border-t pt-5">
          <h3 className="font-medium">
            <Trans>Properties</Trans>
          </h3>
          {customer.properties.length === 0 ? (
            <p className="text-muted-foreground">
              <Trans>
                No properties yet. Assign this customer on a property's page.
              </Trans>
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {customer.properties.map((property) => (
                <li key={property.id} className="flex items-center gap-3 py-2">
                  <CountryFlag
                    code={property.country_code}
                    title={property.country_code}
                    className="size-4 shrink-0"
                    aria-label={property.country_code}
                  />
                  <RouterLink
                    to="/admin/properties/$propertyId"
                    params={{ propertyId: property.id }}
                    className="min-w-0 flex-1 truncate underline-offset-4 hover:underline"
                  >
                    {property.name}
                  </RouterLink>
                  <StageBadge stage={property.stage} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </DrawerBody>

      <DrawerFooter>
        <Button variant="outline" onClick={onEdit}>
          <PenSquareIcon />
          <Trans>Edit</Trans>
        </Button>
      </DrawerFooter>
    </>
  );
}

function CustomerEdit({
  customer,
  onDone
}: {
  customer: CustomerDetail;
  onDone: () => void;
}) {
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
    onSuccess: async () => {
      // The Customer's name is also shown on its Properties. Waiting for the
      // refetch keeps the read-only view from flashing the old values.
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(t`Customer updated successfully`);
      onDone();
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
    <>
      <DrawerHeader>
        <DrawerTitle className="pr-10">
          <Trans>Edit customer</Trans>
        </DrawerTitle>
      </DrawerHeader>
      <form
        onSubmit={form.handleSubmit((data) =>
          updateCustomerMutation.mutate(data)
        )}
        className="flex min-h-0 flex-1 flex-col"
        noValidate
      >
        <DrawerBody>
          <CustomerFields control={form.control} />
        </DrawerBody>
        <DrawerFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            <Trans>Cancel</Trans>
          </Button>
          <Button type="submit" disabled={updateCustomerMutation.isPending}>
            {updateCustomerMutation.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
            <Trans>Save Changes</Trans>
          </Button>
        </DrawerFooter>
      </form>
    </>
  );
}
