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
import Flag from 'react-flagkit';

import type { User } from '@/api/users';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { RowActions } from './row-actions';
import { Badge } from '@/components/ui/badge';

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

function getCountryName(countryCode: string): string {
  const countryMap: Record<string, string> = {
    DE: 'Germany',
    US: 'United States',
    AT: 'Austria',
    CH: 'Switzerland'
  };
  return countryMap[countryCode] || countryCode;
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
  const { t } = useLingui();

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
                <div className="font-medium text-foreground truncate">
                  {fullName || <Trans>No name</Trans>}
                </div>
                <div className="text-muted-foreground truncate">
                  {row.original.email}
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
          const countryName = getCountryName(countryCode);
          return (
            <div className="flex items-center gap-2">
              <Flag
                country={countryCode}
                title={countryCode}
                className="size-3.5 rounded-sm"
                aria-label={countryCode}
              />
              <span className="text-foreground">{countryName}</span>
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
          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((role) => (
                <Badge key={role.id} variant="secondary" size="xs">
                  {role.name}
                </Badge>
              ))}
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
    [t]
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
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
