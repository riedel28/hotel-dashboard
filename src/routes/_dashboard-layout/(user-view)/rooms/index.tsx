import { Trans, useLingui } from '@lingui/react/macro';
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import {
  BuildingIcon,
  ChevronDownIcon,
  DoorOpenIcon,
  DownloadIcon,
  PlusIcon,
  UploadIcon
} from 'lucide-react';
import { useState } from 'react';
import { roomSortColumns, roomStatusSchema } from 'shared/types/rooms';
import { z } from 'zod';

import {
  roomByIdQueryOptions,
  roomFilterOptionsQueryOptions,
  roomsQueryOptions
} from '@/api/rooms';
import { useAuth } from '@/auth';
import { QueryBoundary } from '@/components/query-boundary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { lenientSearch } from '@/lib/search-params';
import { cn } from '@/lib/utils';

import { ImportRoomsDialog } from './-components/import-rooms/import-rooms-dialog';
import { ROOM_TEMPLATES } from './-components/import-rooms/upload-step';
import { RoomFormDrawer } from './-components/room-form-drawer';
import { RoomsFilters } from './-components/rooms-filters';
import RoomsTable from './-components/rooms-table/rooms-table';
import { useRoomsSearch } from './-hooks/use-rooms-search';

const PAGE_SIZES = [5, 10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

const roomsSearchSchema = z.object({
  // A room number typed into the URL by hand arrives as a number
  q: z.union([z.string(), z.number().transform(String)]).optional(),
  status: roomStatusSchema.optional(),
  room_type: z.array(z.string()).optional(),
  floor: z.array(z.number().int()).optional(),
  page: z.number().int().positive().default(1),
  per_page: z
    .number()
    .refine((size) => PAGE_SIZES.includes(size))
    .default(DEFAULT_PAGE_SIZE),
  sort_by: z.enum(roomSortColumns).default('room_number'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  // The room open in the form; 'new' for an empty one
  edit: z.union([z.number().int().positive(), z.literal('new')]).optional()
});

function RoomsPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Rooms`);
  const { user } = useAuth();
  const { openForm } = useRoomsSearch();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const hasProperty = Boolean(user?.selected_property_id);
  // Rooms are edited by administrators only; everyone else gets the list
  const canManage = Boolean(user?.is_admin) && hasProperty;

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
              <Trans>Rooms</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between">
        <h1 className="text-xl font-bold">
          <Trans>Rooms</Trans>
        </h1>
        {canManage && (
          <div className="flex gap-2">
            {/* One control: Import, with the templates behind the arrow */}
            <div className="flex">
              <Button
                variant="outline"
                className="rounded-r-none"
                onClick={() => setIsImportOpen(true)}
              >
                <UploadIcon />
                <Trans>Import</Trans>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={(props) => (
                    <Button
                      variant="outline"
                      aria-label={t`Download template`}
                      // No left border: the Import button's right one is the divider. Two
                      // overlapping borders would add up, the dark one being translucent
                      className="rounded-l-none border-l-0 px-2"
                      {...props}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  )}
                />
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuItem
                    render={(props) => (
                      <a {...props} href={ROOM_TEMPLATES.csv} download>
                        <DownloadIcon />
                        <Trans>Download CSV template</Trans>
                      </a>
                    )}
                  />
                  <DropdownMenuItem
                    render={(props) => (
                      <a {...props} href={ROOM_TEMPLATES.xlsx} download>
                        <DownloadIcon />
                        <Trans>Download XLSX template</Trans>
                      </a>
                    )}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button onClick={() => openForm('new')}>
              <PlusIcon aria-hidden="true" />
              <Trans>Add room</Trans>
            </Button>
          </div>
        )}
      </div>

      {hasProperty ? (
        <QueryBoundary
          className="min-h-[60vh] items-center justify-center"
          message={<Trans>An error occurred while fetching rooms</Trans>}
          fallback={
            // An empty row as tall as the filters keeps the table in place
            <div className="space-y-2.5">
              <div className="h-9" />
              <RoomsTable data={[]} isLoading />
            </div>
          }
        >
          <RoomsContent
            canManage={canManage}
            onImport={() => setIsImportOpen(true)}
          />
        </QueryBoundary>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BuildingIcon />
            </EmptyMedia>
            <EmptyTitle>
              <Trans>No property selected</Trans>
            </EmptyTitle>
            <EmptyDescription>
              <Trans>
                Select a property at the top of the page to see its rooms.
              </Trans>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {canManage && (
        <ImportRoomsDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
      )}
    </div>
  );
}

interface RoomsContentProps {
  canManage: boolean;
  onImport: () => void;
}

function RoomsContent({ canManage, onImport }: RoomsContentProps) {
  const queryClient = useQueryClient();
  const search = useRoomsSearch();
  const { formTarget } = search;

  const roomsQuery = useSuspenseQuery(roomsQueryOptions(search.params));
  const { data: options } = useSuspenseQuery(roomFilterOptionsQueryOptions());
  const rooms = roomsQuery.data.index;

  // The room being edited is normally on the page; a link to one that is
  // not gets it from the API
  const editingId = typeof formTarget === 'number' ? formTarget : undefined;
  const listed = rooms.find((room) => room.id === editingId);
  const { data: fetched } = useQuery({
    ...roomByIdQueryOptions(editingId ?? 0),
    enabled: canManage && editingId !== undefined && !listed
  });
  const editing = editingId === undefined ? null : (listed ?? fetched);

  const form = canManage && (
    <RoomFormDrawer
      open={formTarget === 'new' || editing != null}
      onOpenChange={(open) => !open && search.closeForm()}
      room={editing}
      roomTypes={options.room_types}
    />
  );

  if (roomsQuery.data.total === 0 && !search.hasActiveFilters) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <DoorOpenIcon />
            </EmptyMedia>
            <EmptyTitle>
              <Trans>No rooms yet</Trans>
            </EmptyTitle>
            <EmptyDescription>
              {canManage ? (
                <Trans>
                  Add the rooms of this property one by one, or import them from
                  a CSV or XLSX file.
                </Trans>
              ) : (
                <Trans>An administrator has not added any rooms yet.</Trans>
              )}
            </EmptyDescription>
          </EmptyHeader>
          {canManage && (
            <EmptyContent>
              <Button onClick={() => search.openForm('new')}>
                <PlusIcon aria-hidden="true" />
                <Trans>Add room</Trans>
              </Button>
              <Button variant="outline" onClick={onImport}>
                <UploadIcon className="mr-2 h-4 w-4" />
                <Trans>Import</Trans>
              </Button>
            </EmptyContent>
          )}
        </Empty>
        {form}
      </>
    );
  }

  return (
    <div className="space-y-2.5">
      <RoomsFilters
        filters={search.filters}
        hasActiveFilters={search.hasActiveFilters}
        setFilters={search.setFilters}
        clearFilters={search.clearFilters}
        roomTypes={options.room_types}
        floors={options.floors}
        isRefreshing={roomsQuery.isFetching}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['rooms'] })}
      />

      <div
        className={cn(
          'opacity-100 transition-opacity duration-300 ease-in-out',
          { 'opacity-70': roomsQuery.isFetching }
        )}
      >
        <RoomsTable
          data={rooms}
          pageIndex={search.pageIndex}
          pageSize={search.pageSize}
          totalCount={roomsQuery.data.total}
          pageCount={roomsQuery.data.page_count}
          sort={search.sort}
          onSortChange={search.setSort}
          onPageChange={search.setPage}
          onEdit={canManage ? search.openForm : undefined}
          emptyMessage={<Trans>No rooms match the filters</Trans>}
        />
      </div>

      {form}
    </div>
  );
}

export const Route = createFileRoute('/_dashboard-layout/(user-view)/rooms/')({
  // A stale or hand-edited link loses its bad params, not the whole page
  validateSearch: lenientSearch(roomsSearchSchema),
  // Keep default values out of the URL
  search: {
    middlewares: [
      stripSearchParams({
        page: 1,
        per_page: DEFAULT_PAGE_SIZE,
        sort_by: 'room_number',
        sort_order: 'asc'
      })
    ]
  },
  component: RoomsPage
});
