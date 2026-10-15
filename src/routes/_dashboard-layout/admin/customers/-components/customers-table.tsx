import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import {
  type ColumnDef,
  functionalUpdate,
  type PaginationState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import { PencilIcon } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import {
  type Customer,
  type CustomerSortableColumn,
  customerSortableColumnsSchema
} from 'shared/types/customers';

import { CountryName } from '@/components/country-name';
import { Badge } from '@/components/ui/badge';
import { CountryFlag } from '@/components/ui/country-flag';
import {
  DataGrid,
  DataGridContainer,
  type DataGridFeatures,
  dataGridFeatures
} from '@/components/ui/data-grid';
import { DataGridCards, stopRowClick } from '@/components/ui/data-grid-cards';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridRowActions } from '@/components/ui/data-grid-row-actions';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import type { Page } from '@/lib/paginate';

export interface CustomerSort {
  by: CustomerSortableColumn;
  order: 'asc' | 'desc';
}

function RowActions({ customer }: { customer: Customer }) {
  return (
    <DropdownMenu>
      <DataGridRowActions />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          render={(props) => (
            <RouterLink
              {...props}
              to="/admin/customers/$customerId"
              params={{ customerId: customer.id }}
              preload="intent"
            >
              <PencilIcon />
              <Trans>Edit customer</Trans>
            </RouterLink>
          )}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const propertyLinkClass =
  'truncate text-link underline-offset-4 hover:underline';

/** The first Property by name, and a "+N" badge that lists all of them. */
function PropertiesCell({
  properties
}: {
  properties: Customer['properties'];
}) {
  const { t } = useLingui();
  const [first, ...rest] = properties;

  if (!first) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <RouterLink
        to="/admin/properties/$propertyId"
        params={{ propertyId: first.id }}
        className={propertyLinkClass}
        title={first.name}
        onClick={stopRowClick}
      >
        {first.name}
      </RouterLink>
      {rest.length > 0 && (
        <Popover>
          <PopoverTrigger
            openOnHover
            delay={150}
            className="shrink-0 cursor-pointer rounded-md"
            onClick={stopRowClick}
            aria-label={t`Show all ${properties.length} properties`}
          >
            <Badge
              variant="secondary"
              color="gray"
              size="xs"
              className="tabular-nums"
            >
              +{rest.length}
            </Badge>
          </PopoverTrigger>
          {/* Portalled, but its clicks still bubble to the row in React */}
          <PopoverContent
            align="start"
            className="w-auto max-w-72 p-3"
            onClick={stopRowClick}
          >
            <ul className="flex flex-col gap-1.5">
              {properties.map((property) => (
                <li
                  key={property.id}
                  className="flex min-w-0 items-center gap-2"
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
                    className={propertyLinkClass}
                  >
                    {property.name}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

/**
 * A customer as a phone card: name, company, where they are and how many
 * properties they own, the whole card opening the customer.
 */
function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <>
      <div className="min-w-0 flex-1 space-y-1">
        <RouterLink
          to="/admin/customers/$customerId"
          params={{ customerId: customer.id }}
          preload="intent"
          // Stretched over the card, so all of it opens the customer
          className="block truncate font-medium after:absolute after:inset-0"
        >
          {customer.first_name} {customer.last_name}
        </RouterLink>
        {customer.company_name && (
          <div className="truncate text-sm text-muted-foreground">
            {customer.company_name}
          </div>
        )}
        <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate">{customer.city}</span>
          <span aria-hidden>·</span>
          <CountryName code={customer.country_code} />
        </div>
        <div className="text-xs text-muted-foreground">
          <Plural
            value={customer.properties.length}
            _0="No properties"
            one="# property"
            other="# properties"
          />
        </div>
      </div>
      {/* Above the stretched link */}
      <div className="relative">
        <RowActions customer={customer} />
      </div>
    </>
  );
}

interface CustomersTableProps {
  /** One page of the customers, as the server filtered and ordered them. */
  page: Page<Customer>;
  /** The column the list is ordered by; none means the default order. */
  sort?: CustomerSort;
  onSortChange?: (sort: CustomerSort | undefined) => void;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  isLoading?: boolean;
  /** Shown in place of the rows when there are none. */
  emptyMessage?: ReactNode;
  /** A failed load (`tableLoadError`), shown in place of the rows. */
  error?: ReactNode;
}

export function CustomersTable({
  page,
  sort,
  onSortChange,
  onPageChange,
  isLoading = false,
  emptyMessage,
  error
}: CustomersTableProps) {
  const { t } = useLingui();
  const navigate = useNavigate();

  // The table library's shapes for what the page keeps as a sort and a page
  const sorting = useMemo<SortingState>(
    () => (sort ? [{ id: sort.by, desc: sort.order === 'desc' }] : []),
    [sort]
  );
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: page.pageIndex, pageSize: page.pageSize }),
    [page.pageIndex, page.pageSize]
  );

  const columns = useMemo<ColumnDef<DataGridFeatures, Customer>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (customer) =>
          `${customer.first_name} ${customer.last_name}`,
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Customer`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row, getValue }) => {
          const name = getValue() as string;
          const company = row.original.company_name;
          return (
            <div className="min-w-0">
              {/* The keyboard way into the customer; a click anywhere on the
                  row opens it too */}
              <RouterLink
                to="/admin/customers/$customerId"
                params={{ customerId: row.original.id }}
                preload="intent"
                onClick={stopRowClick}
                className="block w-fit max-w-full truncate font-medium underline-offset-4 hover:underline"
                title={name}
              >
                {name}
              </RouterLink>
              {company && (
                <div
                  className="truncate text-xs text-muted-foreground"
                  title={company}
                >
                  {company}
                </div>
              )}
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-8 w-40" />,
          headerTitle: t`Customer`
        },
        size: 220,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true
      },
      {
        accessorKey: 'email',
        id: 'email',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Email`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <span className="line-clamp-1" title={row.original.email}>
            {row.original.email}
          </span>
        ),
        meta: {
          skeleton: <Skeleton className="h-6 w-40" />,
          headerTitle: t`Email`
        },
        size: 220,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        // Just where the Customer is; the street and ZIP are on its page.
        accessorKey: 'city',
        id: 'city',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Address`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const { city, country_code } = row.original;
          return (
            <div className="min-w-0">
              <div className="truncate" title={city}>
                {city}
              </div>
              <CountryName
                code={country_code}
                className="text-xs text-muted-foreground"
              />
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-8 w-36" />,
          headerTitle: t`Address`
        },
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        // Sorted by how many there are
        id: 'property_count',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Properties`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <PropertiesCell properties={row.original.properties} />
        ),
        meta: {
          skeleton: <Skeleton className="h-6 w-40" />,
          headerTitle: t`Properties`
        },
        size: 240,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => (
          // The menu keeps its clicks from opening the row
          <div className="flex justify-center" onClick={stopRowClick}>
            <RowActions customer={row.original} />
          </div>
        ),
        meta: {
          skeleton: (
            <div className="flex items-center justify-center">
              <Skeleton className="h-6 w-6" />
            </div>
          )
        },
        size: 60,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false
      }
    ],
    [t]
  );

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: page.rows,
    pageCount: page.pageCount,
    getRowId: (customer: Customer) => customer.id,
    state: { pagination, sorting },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination);
      onPageChange?.(next.pageIndex, next.pageSize);
    },
    onSortingChange: (updater) => {
      // Sorting cleared, or by a column the list cannot be ordered by:
      // back to the default order
      const [first] = functionalUpdate(updater, sorting);
      const column = customerSortableColumnsSchema.safeParse(first?.id);
      onSortChange?.(
        column.success
          ? { by: column.data, order: first?.desc ? 'desc' : 'asc' }
          : undefined
      );
    },
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: true
  });

  return (
    <DataGrid
      table={table}
      recordCount={page.totalCount}
      onRowClick={(customer) =>
        void navigate({
          to: '/admin/customers/$customerId',
          params: { customerId: customer.id }
        })
      }
      tableClassNames={{ edgeCell: 'px-5' }}
      tableLayout={{
        columnsPinnable: false,
        columnsMovable: false,
        columnsVisibility: false
      }}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      error={error}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer className="hidden sm:block">
          <DataGridTable />
        </DataGridContainer>
        <DataGridCards<Customer>
          className="sm:hidden"
          renderCard={(customer) => <CustomerCard customer={customer} />}
        />
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
