import { Trans, useLingui } from '@lingui/react/macro';
import { Link as RouterLink } from '@tanstack/react-router';
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
import { type Page, paginate } from '@/lib/paginate';

export interface CustomerSort {
  by: CustomerSortableColumn;
  order: 'asc' | 'desc';
}

function RowActions({ customer }: { customer: Customer }) {
  return (
    <DropdownMenu>
      <DataGridRowActions />
      <DropdownMenuContent align="end" className="w-auto min-w-0">
        <DropdownMenuItem
          render={(props) => (
            <RouterLink
              {...props}
              to="/admin/customers/$customerId"
              params={{ customerId: customer.id }}
              preload="intent"
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              <Trans>Edit Customer</Trans>
            </RouterLink>
          )}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const propertyLinkClass = 'truncate underline-offset-4 hover:underline';

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
      >
        {first.name}
      </RouterLink>
      {rest.length > 0 && (
        <Popover>
          <PopoverTrigger
            openOnHover
            delay={150}
            className="shrink-0 cursor-pointer rounded-md"
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
          <PopoverContent align="start" className="w-auto max-w-72 p-3">
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

// What the table shows while the customers load: ten placeholder rows
const loadingPage = paginate<Customer>([], 0, 10);

/** The table's shape while the customers load. */
export function CustomersTableSkeleton() {
  return <CustomersTable page={loadingPage} isLoading />;
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
}

export function CustomersTable({
  page,
  sort,
  onSortChange,
  onPageChange,
  isLoading = false,
  emptyMessage
}: CustomersTableProps) {
  const { t } = useLingui();

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
              <div className="truncate font-medium" title={name}>
                {name}
              </div>
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
        size: 240,
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
        size: 240,
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
        size: 220,
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
        size: 260,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => (
          <div className="flex justify-center">
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
        size: 70,
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
      tableClassNames={{ edgeCell: 'px-5' }}
      tableLayout={{
        columnsPinnable: false,
        columnsMovable: false,
        columnsVisibility: false
      }}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
