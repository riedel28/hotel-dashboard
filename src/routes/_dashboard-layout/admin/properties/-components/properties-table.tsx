import { Trans, useLingui } from '@lingui/react/macro';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { customerLabel } from 'shared/types/customers';
import type { Property } from 'shared/types/properties';

import { CountryName } from '@/components/country-name';
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
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { StageBadge } from '@/components/ui/stage-badge';

import { DeletePropertyDialog } from './delete-property-dialog';
import { PropertyOptionsCell } from './property-options-cell';

// A page holds every property most installations have
export const PER_PAGE = 25;

function RowActions({ row }: { row: { original: Property } }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DataGridRowActions />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={(props) => (
              <RouterLink
                {...props}
                to="/admin/properties/$propertyId"
                params={{ propertyId: row.original.id }}
                preload="intent"
              >
                <PencilIcon />
                <Trans>Edit property</Trans>
              </RouterLink>
            )}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive-soft"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2Icon />
            <Trans>Delete property</Trans>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePropertyDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        propertyName={row.original.name}
        propertyId={row.original.id}
      />
    </>
  );
}

/**
 * A property as a phone card: name, stage, country and customer, the whole
 * card opening the property.
 */
function PropertyCard({ property }: { property: Property }) {
  return (
    <>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <RouterLink
            to="/admin/properties/$propertyId"
            params={{ propertyId: property.id }}
            preload="intent"
            // Stretched over the card, so all of it opens the property
            className="truncate font-medium after:absolute after:inset-0"
          >
            {property.name}
          </RouterLink>
          <StageBadge stage={property.stage} size="sm" />
        </div>
        <CountryName
          code={property.country_code}
          className="text-xs text-muted-foreground"
        />
        {property.customer && (
          <div className="truncate text-sm text-muted-foreground">
            {customerLabel(property.customer)}
          </div>
        )}
      </div>
      {/* Above the stretched link */}
      <div className="relative">
        <RowActions row={{ original: property }} />
      </div>
    </>
  );
}

export interface PropertiesTableProps {
  /** Shown in place of the rows when there are none. */
  emptyMessage?: ReactNode;
  /** A failed load (`tableLoadError`), shown in place of the rows. */
  error?: ReactNode;
  data: Property[];
  isLoading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  pageCount?: number;
  onPaginationChange?: (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => void;
  sorting?: SortingState;
  onSortingChange?: (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => void;
}

export function PropertiesTable({
  emptyMessage,
  error,
  data,
  isLoading = false,
  pageIndex = 0,
  pageSize = PER_PAGE,
  totalCount = 0,
  pageCount = 0,
  onPaginationChange,
  sorting,
  onSortingChange
}: PropertiesTableProps) {
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );

  const { i18n, t } = useLingui();
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<DataGridFeatures, Property>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Property`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const { name, country_code } = row.original;
          return (
            <div className="min-w-0">
              {/* The keyboard way into the property; a click anywhere on the
                  row opens it too */}
              <RouterLink
                to="/admin/properties/$propertyId"
                params={{ propertyId: row.original.id }}
                preload="intent"
                onClick={stopRowClick}
                className="block w-fit max-w-full truncate font-medium underline-offset-4 hover:underline"
                title={name}
              >
                {name}
              </RouterLink>
              <CountryName
                code={country_code}
                className="text-xs text-muted-foreground"
              />
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-8 w-40" />,
          headerTitle: t`Property`
        },
        size: 300,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true
      },
      {
        id: 'customer',
        accessorFn: (property) =>
          property.customer ? customerLabel(property.customer) : '',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Customer`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const customer = row.original.customer;
          if (!customer) {
            return <span className="text-muted-foreground">—</span>;
          }
          const label = customerLabel(customer);
          return (
            <RouterLink
              to="/admin/customers/$customerId"
              params={{ customerId: customer.id }}
              preload="intent"
              onClick={stopRowClick}
              // As wide as its text: the rest of the cell is the row
              className="block w-fit max-w-full truncate text-link underline-offset-4 hover:underline"
              title={label}
            >
              {label}
            </RouterLink>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-32" />,
          headerTitle: t`Customer`
        },
        size: 220,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'stage',
        id: 'stage',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Stage`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const stage = row.getValue('stage') as Property['stage'];
          return <StageBadge stage={stage} size="sm" />;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-20" />,
          headerTitle: t`Stage`
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: false
      },
      {
        accessorKey: 'options',
        id: 'options',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Solutions`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <PropertyOptionsCell options={row.original.options} />
        ),
        meta: {
          skeleton: <Skeleton className="h-6 w-48" />,
          headerTitle: t`Solutions`
        },
        size: 340,
        enableSorting: false,
        enableHiding: true,
        enableResizing: true
      },
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => (
          // The menu and its dialog keep their clicks from opening the row
          <div className="flex justify-center" onClick={stopRowClick}>
            <RowActions row={row} />
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
    [i18n.locale, t]
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const [, setInternalSorting] = useState<SortingState>([]);

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: data || [],
    pageCount,
    getRowId: (row: Property) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder
    },
    onPaginationChange,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnOrderChange: setColumnOrder,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: true
  });

  return (
    <DataGrid
      table={table}
      recordCount={totalCount}
      onRowClick={(property) =>
        void navigate({
          to: '/admin/properties/$propertyId',
          params: { propertyId: property.id }
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
        <DataGridCards<Property>
          className="sm:hidden"
          renderCard={(property) => <PropertyCard property={property} />}
        />
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
