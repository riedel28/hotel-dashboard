import { Trans, useLingui } from '@lingui/react/macro';
import {
  useQuery,
  useQueryClient,
  type UseQueryResult
} from '@tanstack/react-query';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { BuildingIcon, DoorOpenIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import {
  type FetchRoomsResponse,
  roomSortColumns,
  roomStatusSchema
} from 'shared/types/rooms';
import { z } from 'zod';

import { roomFilterOptionsQueryOptions, roomsQueryOptions } from '@/api/rooms';
import { useAuth } from '@/auth';
import {
  EmptyFilterResult,
  EmptyTableState
} from '@/components/empty-table-state';
import { tableLoadError } from '@/components/load-error';
import { PageHeader } from '@/components/page-header';
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { lenientSearch } from '@/lib/search-params';
import { cn } from '@/lib/utils';

import { ImportButton } from './-components/import-rooms/import-button';
import { ImportRoomsDialog } from './-components/import-rooms/import-rooms-dialog';
import { RoomFormDrawer } from './-components/room-form-drawer';
import { RoomsFilters } from './-components/rooms-filters';
import RoomsTable from './-components/rooms-table/rooms-table';
import { useEditingRoom } from './-hooks/use-editing-room';
import { useRoomsSearch } from './-hooks/use-rooms-search';

const PAGE_SIZES = [5, 10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

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
  const search = useRoomsSearch();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const hasProperty = Boolean(user?.selected_property_id);
  // Rooms are edited by administrators only; everyone else gets the list
  const canManage = Boolean(user?.is_admin) && hasProperty;

  // A plain query, not a suspense one: a change of filter, sorting or page
  // keeps the rows on screen (dimmed) until the new ones arrive, and the
  // filters never leave. Only the very first load shows the skeleton.
  const roomsQuery = useQuery({
    ...roomsQueryOptions(search.params),
    enabled: hasProperty
  });

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

      <PageHeader
        title={<Trans>Rooms</Trans>}
        description={
          <Trans>The property's rooms, their type, floor and status.</Trans>
        }
        actions={
          canManage && (
            <>
              <ImportButton onImport={() => setIsImportOpen(true)} />
              <Button onClick={() => search.openForm('new')}>
                <PlusIcon aria-hidden="true" />
                <Trans>Add room</Trans>
              </Button>
            </>
          )
        }
      />

      {hasProperty ? (
        <RoomsContent roomsQuery={roomsQuery} canManage={canManage} />
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
  /** The page of rooms the URL asks for; the page header reads it too */
  roomsQuery: UseQueryResult<FetchRoomsResponse>;
  canManage: boolean;
}

function RoomsContent({ roomsQuery, canManage }: RoomsContentProps) {
  const queryClient = useQueryClient();
  const search = useRoomsSearch();

  const { data: options = { room_types: [], floors: [] } } = useQuery(
    roomFilterOptionsQueryOptions()
  );
  const rooms = roomsQuery.data?.index ?? [];
  // Only those who may edit have a form to open
  const form = useEditingRoom(canManage ? search.formTarget : undefined, rooms);
  // The property has no rooms at all (not: none match the filters)
  const hasNoRooms = roomsQuery.data?.total === 0 && !search.hasActiveFilters;

  return (
    <>
      <div className="space-y-2.5">
        <RoomsFilters
          filters={search.filters}
          hasActiveFilters={search.hasActiveFilters}
          setFilters={search.setFilters}
          clearFilters={search.clearFilters}
          roomTypes={options.room_types}
          floors={options.floors}
          isRefreshing={roomsQuery.isFetching}
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ['rooms'] })
          }
        />

        <div
          className={cn('transition-opacity duration-300 ease-in-out', {
            'opacity-70': roomsQuery.isFetching
          })}
        >
          <RoomsTable
            error={tableLoadError(
              roomsQuery,
              <Trans>Couldn't load rooms</Trans>
            )}
            data={rooms}
            isLoading={roomsQuery.isLoading}
            pageIndex={search.pageIndex}
            pageSize={search.pageSize}
            totalCount={roomsQuery.data?.total ?? 0}
            pageCount={roomsQuery.data?.page_count ?? 0}
            sort={search.sort}
            onSortChange={search.setSort}
            onPageChange={search.setPage}
            onEdit={canManage ? search.openForm : undefined}
            selectedRoomId={
              canManage && typeof search.formTarget === 'number'
                ? search.formTarget
                : undefined
            }
            emptyMessage={
              hasNoRooms ? (
                <EmptyTableState
                  icon={<DoorOpenIcon />}
                  title={<Trans>No rooms yet</Trans>}
                  description={
                    canManage ? (
                      <Trans>
                        Add the rooms of this property one by one, or import
                        them from a CSV or XLSX file.
                      </Trans>
                    ) : (
                      <Trans>
                        An administrator has not added any rooms yet.
                      </Trans>
                    )
                  }
                  action={
                    canManage
                      ? {
                          label: <Trans>Add room</Trans>,
                          icon: <PlusIcon aria-hidden="true" />,
                          onClick: () => search.openForm('new')
                        }
                      : undefined
                  }
                />
              ) : (
                <EmptyFilterResult
                  description={<Trans>No rooms match the filters.</Trans>}
                  onClearFilters={search.clearFilters}
                />
              )
            }
          />
        </div>
      </div>

      {canManage && (
        <RoomFormDrawer
          open={form.isOpen}
          onOpenChange={(open) => !open && search.closeForm()}
          room={form.room}
          roomTypes={options.room_types}
          pageRooms={rooms}
          onSelect={search.openForm}
        />
      )}
    </>
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
