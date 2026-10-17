import { Trans, useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ImageIcon } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { eventSortColumns } from 'shared/types/events';

import type { HotelEvent } from '@/api/events';
import { imageUrl } from '@/api/images';
import { Badge, badgeVariants } from '@/components/ui/badge';
import {
  DataGrid,
  DataGridContainer,
  type DataGridFeatures,
  dataGridFeatures
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useFormatLocalized } from '@/hooks/use-format-localized';
import { cn } from '@/lib/utils';

import type { EventSortColumn } from '../-hooks/use-events-search';
import { eventCategoryLabels } from '../-lib/event-categories';
import { inZone } from '../-lib/event-form';
import { EventRowActions } from './event-row-actions';

const VISIBLE_CATEGORIES = 2;

const sortColumnOf = (id: string): EventSortColumn | undefined =>
  eventSortColumns.find((column) => column === id);

function EventCell({ event }: { event: HotelEvent }) {
  const cover = event.image_ids[0];

  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground">
        {cover ? (
          <img
            src={imageUrl(cover)}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <ImageIcon className="size-4" aria-hidden="true" />
        )}
      </span>
      <span className="truncate font-medium" title={event.title}>
        {event.title}
      </span>
    </span>
  );
}

function CategoriesCell({ event }: { event: HotelEvent }) {
  const { t } = useLingui();
  const labels = event.categories.map((category) =>
    t(eventCategoryLabels[category])
  );
  const hidden = labels.slice(VISIBLE_CATEGORIES);
  if (labels.length === 0)
    return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex min-w-0 items-center gap-1">
      {labels.slice(0, VISIBLE_CATEGORIES).map((label) => (
        <Badge
          key={label}
          color="gray"
          size="sm"
          className="min-w-0 shrink"
          title={label}
        >
          <span className="truncate">{label}</span>
        </Badge>
      ))}
      {hidden.length > 0 && (
        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-label={hidden.join(', ')}
            // Shows the rest without opening the row
            onClick={(event) => event.stopPropagation()}
            className={cn(badgeVariants({ color: 'gray', size: 'sm' }))}
          >
            +{hidden.length}
          </TooltipTrigger>
          <TooltipContent>
            <ul>
              {hidden.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

/** Start in the hotel's timezone, or start → end over several days. */
function TimeCell({ event, zone }: { event: HotelEvent; zone: string }) {
  const start = inZone(event.starts_at, zone);
  const end = inZone(event.ends_at, zone);
  const doors = event.doors_open_at && inZone(event.doors_open_at, zone);
  const multiDay = !start.isSame(end, 'day');
  const formatLocalized = useFormatLocalized();
  // The weekday in full and in the UI language, e.g. "Friday 23.10"
  const day = (value: dayjs.Dayjs) =>
    `${formatLocalized(value.toDate(), { weekday: 'long', timeZone: zone })} ${value.format(
      value.year() === dayjs().year() ? 'DD.MM' : 'DD.MM.YYYY'
    )}`;

  return (
    <span className="flex flex-col text-[13px] leading-tight tabular-nums">
      <time dateTime={event.starts_at} className="whitespace-nowrap">
        {day(start)}{' '}
        <span className="text-muted-foreground">{start.format('HH:mm')}</span>
        {multiDay && (
          <>
            {' → '}
            {day(end)}{' '}
            <span className="text-muted-foreground">{end.format('HH:mm')}</span>
          </>
        )}
      </time>
      {doors && (
        <span className="text-xs text-muted-foreground">
          <Trans>doors {doors.format('HH:mm')}</Trans>
        </span>
      )}
    </span>
  );
}

function LocationCell({ event }: { event: HotelEvent }) {
  return (
    <span className="flex min-w-0 flex-col leading-tight">
      <span className="truncate" title={event.venue_name}>
        {event.venue_name}
      </span>
      <span className="truncate text-xs text-muted-foreground">
        {event.city}
      </span>
    </span>
  );
}

interface EventsTableProps {
  data: HotelEvent[];
  /** The hotel's timezone, which times are shown in. */
  zone: string;
  isLoading?: boolean;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  pageCount: number;
  sort: { by: EventSortColumn; order: 'asc' | 'desc' };
  onSortChange: (by: EventSortColumn, order: 'asc' | 'desc') => void;
  onPageChange: (pageIndex: number, pageSize: number) => void;
  onOpen: (eventId: number) => void;
  emptyMessage?: ReactNode;
  /** A failed load (`LoadErrorState`), shown where the rows go. */
  error?: ReactNode;
}

export function EventsTable({
  data,
  zone,
  isLoading = false,
  pageIndex,
  pageSize,
  totalCount,
  pageCount,
  sort,
  onSortChange,
  onPageChange,
  onOpen,
  emptyMessage,
  error
}: EventsTableProps) {
  const { t } = useLingui();

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );
  const sorting = useMemo<SortingState>(
    () => [{ id: sort.by, desc: sort.order === 'desc' }],
    [sort.by, sort.order]
  );

  const columns = useMemo<ColumnDef<DataGridFeatures, HotelEvent>[]>(() => {
    // The sortable ones read their value: the table sorts only what it can
    // access, though the server does the sorting
    const column = (
      id: EventSortColumn | 'categories' | 'location',
      title: string,
      size: number,
      render: (event: HotelEvent) => ReactNode
    ): ColumnDef<DataGridFeatures, HotelEvent> => {
      const sortColumn = sortColumnOf(id);
      return {
        id,
        ...(sortColumn && {
          accessorFn: (event: HotelEvent) => event[sortColumn]
        }),
        header: ({ column }) => (
          <DataGridColumnHeader
            title={title}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => render(row.original),
        meta: {
          skeleton: <Skeleton className="h-8 w-28" />,
          headerTitle: title
        },
        size,
        enableSorting: sortColumn !== undefined,
        enableHiding: true,
        enableResizing: true
      };
    };

    return [
      column('title', t`Event`, 280, (event) => <EventCell event={event} />),
      column('categories', t`Categories`, 200, (event) => (
        <CategoriesCell event={event} />
      )),
      column('starts_at', t`Time`, 320, (event) => (
        <TimeCell event={event} zone={zone} />
      )),
      column('location', t`Location`, 200, (event) => (
        <LocationCell event={event} />
      )),
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => (
          // The menu and its dialog keep their clicks from opening the row
          <div
            className="flex justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <EventRowActions event={row.original} />
          </div>
        ),
        meta: {
          skeleton: (
            <div className="flex items-center justify-center">
              <Skeleton className="h-6 w-6" />
            </div>
          )
        },
        size: 56,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false
      }
    ];
  }, [t, zone]);

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    pageCount,
    getRowId: (row: HotelEvent) => row.id.toString(),
    state: { pagination, sorting },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(pagination) : updater;
      onPageChange(next.pageIndex, next.pageSize);
    },
    onSortingChange: (updater) => {
      const [next] = typeof updater === 'function' ? updater(sorting) : updater;
      const by = next && sortColumnOf(next.id);
      if (by) onSortChange(by, next.desc ? 'desc' : 'asc');
    },
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false
  });

  return (
    <DataGrid
      error={error}
      table={table}
      recordCount={totalCount}
      onRowClick={(event) => onOpen(event.id)}
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
