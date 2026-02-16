import { Trans, useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import type { User } from '@/api/users';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CountryFlag } from '@/components/ui/country-flag';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { getCountryName } from '@/lib/countries';
import { RowActions } from './row-actions';

interface UsersTableProps {
  data: User[];
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

function getInitials(
  firstName: string | null,
  lastName: string | null
): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
}

export default function UsersTable({
  data,
  isLoading = false,
  pageIndex = 0,
  pageSize = 10,
  totalCount = 0,
  pageCount = 0,
  onPaginationChange,
  sorting: sortingProp,
  onSortingChange
}: UsersTableProps) {
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  );

  const [internalSorting, setInternalSorting] = useState<SortingState>([
    { id: 'created_at', desc: true }
  ]);
  const sorting = sortingProp ?? internalSorting;
  const { i18n, t } = useLingui();

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'first_name',
        id: 'first_name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`User`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const fullName = [row.original.first_name, row.original.last_name]
            .filter(Boolean)
            .join(' ');
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarFallback>
                  {getInitials(row.original.first_name, row.original.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-px min-w-0 flex-1">
                <div className="font-medium text-foreground truncate flex items-center gap-2">
                  {fullName || <Trans>No name</Trans>}
                  {!row.original.email_verified && (
                    <Badge
                      size="xs"
                      variant="warning"
                      className="shrink-0 rounded-md border border-foreground/10 capitalize"
                    >
                      <Trans>Pending</Trans>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        },
        meta: {
          skeleton: (
            <div className="flex h-[41px] items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          )
        },
        size: 250,
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
        cell: (info) => (
          <span className="truncate block max-w-full">
            {info.getValue() as string}
          </span>
        ),
        size: 200,
        meta: {
          headerClassName: '',
          cellClassName: 'text-left',
          skeleton: <Skeleton className="h-7 w-40" />
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'country_code',
        id: 'country_code',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Country`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const countryCode = row.original.country_code;
          if (!countryCode) {
            return null;
          }
          return (
            <div className="flex items-center gap-2">
              <CountryFlag
                code={countryCode}
                title={countryCode}
                className="size-4"
                aria-label={countryCode}
              />
              <span className="text-foreground">
                {getCountryName(countryCode, i18n.locale)}
              </span>
            </div>
          );
        },
        size: 150,
        meta: {
          headerClassName: '',
          cellClassName: 'text-start',
          skeleton: <Skeleton className="h-7 w-24" />
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'roles',
        id: 'roles',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Roles`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const roles = row.original.roles;
          if (roles.length === 0) {
            return null;
          }
          const firstRole = roles[0]!;
          const rest = roles.slice(1);
          return (
            <div className="flex items-center gap-1.5">
              <Badge
                size="xs"
                variant="secondary"
                className="shrink-0 rounded-md text-foreground/80 border border-foreground/10 capitalize"
              >
                {firstRole.name}
              </Badge>
              {rest.length > 0 && (
                <Popover>
                  <PopoverTrigger className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80">
                    +{rest.length}
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto min-w-48 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      {t`${roles.length} roles total`}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {roles.map((role) => (
                        <Badge
                          key={role.id}
                          size="xs"
                          variant="secondary"
                          className="shrink-0 rounded-md text-foreground/80 border border-foreground/10 capitalize"
                        >
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-7 w-20" />
        },
        size: 150,
        enableSorting: false,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'actions',
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
          return (
            <div className="flex justify-center">
              <RowActions row={row} />
            </div>
          );
        },
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

  const table = useReactTable({
    columns,
    data: data || [],
    pageCount: pageCount,
    getRowId: (row: User) => row.id.toString(),
    state: {
      pagination,
      sorting,
      columnOrder
    },
    onPaginationChange: onPaginationChange,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true
  });

  return (
    <DataGrid
      table={table}
      recordCount={totalCount}
      tableClassNames={{
        edgeCell: 'px-5'
      }}
      tableLayout={{
        columnsPinnable: false,
        columnsMovable: false,
        columnsVisibility: false
      }}
      isLoading={isLoading}
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
