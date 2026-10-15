import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { z } from 'zod';

import { fetchPaymentsParamsSchema } from '@/api/payments';
import { LoadError } from '@/components/load-error';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { lenientSearch } from '@/lib/search-params';
import { cn } from '@/lib/utils';

import { PaymentDetailsDrawer } from './-components/payment-details-drawer';
import { PaymentsFilters } from './-components/payments-filters';
import { PaymentsTable } from './-components/payments-table';
import {
  DEFAULT_PAGE_SIZE,
  usePaymentsSearch
} from './-hooks/use-payments-search';

// The page's own state on top of the list filters: the payment in the drawer
const paymentsSearchSchema = fetchPaymentsParamsSchema.extend({
  // The router reads ?q=1704 as a number; card digits are searched as text
  q: z.coerce.string().max(200).optional(),
  payment: z.coerce.number().int().positive().optional()
});

function PaymentsPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Payments`);
  const search = usePaymentsSearch();
  const { paymentsQuery } = search;
  const payments = paymentsQuery.data?.index ?? [];

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Payments</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* As tall as the same row on pages that have an action button in it */}
      <div className="mb-6 flex min-h-9 justify-between">
        <h1 className="text-xl font-bold">
          <Trans>Payments</Trans>
        </h1>
      </div>

      <div className="space-y-2.5">
        <PaymentsFilters
          filters={search.filters}
          hasActiveFilters={search.hasActiveFilters}
          setQuery={search.setQuery}
          setStatus={search.setStatus}
          setRange={search.setRange}
          clearFilters={search.clearFilters}
        />

        <div
          className={cn('transition-opacity duration-300 ease-in-out', {
            'opacity-70': paymentsQuery.isFetching
          })}
        >
          {paymentsQuery.isError ? (
            <LoadError
              message={paymentsQuery.error.message}
              fallbackMessage={
                <Trans>An error occurred while fetching payments</Trans>
              }
              isRetrying={paymentsQuery.isFetching}
              onRetry={() => paymentsQuery.refetch()}
            />
          ) : (
            <PaymentsTable
              data={payments}
              isLoading={paymentsQuery.isLoading}
              totalCount={paymentsQuery.data?.total ?? 0}
              pageCount={paymentsQuery.data?.page_count ?? 0}
              pagination={search.pagination}
              onPaginationChange={search.onPaginationChange}
              sorting={search.sorting}
              onSortingChange={search.onSortingChange}
              selectedPaymentId={search.openPaymentId}
              onPaymentOpen={search.openPayment}
              emptyMessage={
                <EmptyPayments
                  isFiltered={search.hasActiveFilters}
                  onClearFilters={search.clearFilters}
                />
              }
            />
          )}
        </div>
      </div>

      <PaymentDetailsDrawer
        paymentId={search.openPaymentId}
        pagePayments={payments}
        onSelect={search.selectPayment}
        onClose={search.closePayment}
      />
    </div>
  );
}

function EmptyPayments({
  isFiltered,
  onClearFilters
}: {
  isFiltered: boolean;
  onClearFilters: () => void;
}) {
  if (!isFiltered) {
    return (
      <div className="flex flex-col items-center gap-1 py-6 text-sm">
        <p className="font-medium text-foreground">
          <Trans>No payments yet</Trans>
        </p>
        <p className="text-muted-foreground">
          <Trans>Payments appear here once the gateway authorizes them.</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 py-6 text-sm">
      <p className="font-medium text-foreground">
        <Trans>Nothing found</Trans>
      </p>
      <p className="text-muted-foreground">
        <Trans>No payments match the current filters.</Trans>
      </p>
      <Button
        variant="secondary"
        size="sm"
        className="mt-2"
        onClick={onClearFilters}
      >
        <Trans>Clear filters</Trans>
      </Button>
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/payments/'
)({
  // A stale or hand-edited link loses its bad params, not the whole page
  validateSearch: lenientSearch(paymentsSearchSchema),
  // Keep default values out of the URL
  search: {
    middlewares: [
      stripSearchParams({
        page: 1,
        per_page: DEFAULT_PAGE_SIZE,
        sort_by: 'updated_at',
        sort_order: 'desc'
      })
    ]
  },
  component: PaymentsPage
});
