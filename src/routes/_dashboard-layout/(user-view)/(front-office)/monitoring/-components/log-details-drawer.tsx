import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import type { MonitoringLog } from 'shared/types/monitoring';

import { ApiError } from '@/api/client';
import {
  monitoringLogQueryOptions,
  monitoringQueryOptions
} from '@/api/monitoring';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { StatusCell } from './cells/status-cell';
import { TypeCell } from './cells/type-cell';

const RELATED_LOGS_COUNT = 5;
const RELATED_LOGS_SKELETON_ROWS = 3;

interface LogDetailsDrawerProps {
  /** The open log; the drawer is closed while undefined. */
  logId?: number;
  /** Logs of the current table page: instant content and ↑/↓ navigation. */
  pageLogs: MonitoringLog[];
  onSelect: (logId: number) => void;
  onClose: () => void;
  onShowAllForBooking: (bookingNr: string) => void;
}

export function LogDetailsDrawer({
  logId,
  pageLogs,
  onSelect,
  onClose,
  onShowAllForBooking
}: LogDetailsDrawerProps) {
  // ↑/↓ step through the current page and stop at its ends
  useEffect(() => {
    if (logId === undefined) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        return;
      }
      const index = pageLogs.findIndex((log) => log.id === logId);
      const next = pageLogs[index + (event.key === 'ArrowDown' ? 1 : -1)];
      if (index !== -1 && next) {
        event.preventDefault();
        onSelect(next.id);
      }
    };

    // Capture phase: the open dialog stops arrow keys from bubbling this far
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [logId, pageLogs, onSelect]);

  return (
    <Drawer
      open={logId !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <DrawerContent>
        {logId !== undefined && (
          <LogDetails
            // Remount per log so one log's data never shows under another id
            key={logId}
            logId={logId}
            pageLogs={pageLogs}
            onSelect={onSelect}
            onShowAllForBooking={onShowAllForBooking}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function LogDetails({
  logId,
  pageLogs,
  onSelect,
  onShowAllForBooking
}: Required<Pick<LogDetailsDrawerProps, 'logId'>> &
  Omit<LogDetailsDrawerProps, 'logId' | 'onClose'>) {
  const { t } = useLingui();
  const back = useLocation({ select: (location) => location.href });
  const logQuery = useQuery({
    ...monitoringLogQueryOptions(logId),
    initialData: pageLogs.find((log) => log.id === logId)
  });
  const log = logQuery.data;

  const relatedQuery = useQuery({
    ...monitoringQueryOptions({
      booking_nr: log?.booking_nr ?? undefined,
      per_page: RELATED_LOGS_COUNT
    }),
    enabled: Boolean(log?.booking_nr)
  });

  if (!log) {
    const isNotFound =
      logQuery.error instanceof ApiError && logQuery.error.status === 404;

    return (
      <DrawerHeader className="space-y-1 pr-14">
        <DrawerTitle>
          {logQuery.isPending ? (
            <Skeleton className="h-6 w-40" />
          ) : isNotFound ? (
            <Trans>Log not found</Trans>
          ) : (
            <Trans>Something went wrong</Trans>
          )}
        </DrawerTitle>
        <p className="text-sm font-normal text-muted-foreground">
          {logQuery.isPending ? (
            <Trans>Loading log…</Trans>
          ) : isNotFound ? (
            <Trans>This log does not exist or was removed.</Trans>
          ) : (
            logQuery.error?.message
          )}
        </p>
      </DrawerHeader>
    );
  }

  const relatedLogs = relatedQuery.data?.index ?? [];

  return (
    <>
      <DrawerHeader className="space-y-2">
        {/* Only the title row shares its line with the close button */}
        <DrawerTitle className="pr-10">{log.event}</DrawerTitle>
        <div className="flex flex-wrap items-center gap-2 text-sm font-normal text-muted-foreground">
          <StatusCell status={log.status} />
          <TypeCell type={log.type} />
          <time
            dateTime={dayjs(log.logged_at).toISOString()}
            className="tabular-nums"
          >
            {dayjs(log.logged_at).format('DD.MM.YYYY HH:mm:ss')}
          </time>
        </div>
      </DrawerHeader>

      <DrawerBody className="space-y-5">
        {(log.booking_nr || log.sub) && (
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2 text-sm">
            {log.booking_nr && (
              <>
                <dt className="text-muted-foreground">
                  <Trans>Reservation</Trans>
                </dt>
                <dd>
                  {log.reservation_id === null ? (
                    log.booking_nr
                  ) : (
                    <Link
                      to="/reservations/$reservationId"
                      params={{ reservationId: String(log.reservation_id) }}
                      // Back from the reservation reopens this log
                      search={{ back }}
                      className="rounded-sm text-cyan-800 underline-offset-4 hover:underline dark:text-cyan-200/85"
                    >
                      {log.booking_nr}
                    </Link>
                  )}
                </dd>
              </>
            )}
            {log.sub && (
              <>
                <dt className="text-muted-foreground">
                  <Trans>Source</Trans>
                </dt>
                <dd>{log.sub}</dd>
              </>
            )}
          </dl>
        )}

        <section className="space-y-2">
          <h3 className="text-sm font-medium">
            <Trans>Message</Trans>
          </h3>
          <div className="relative">
            {/* Right padding keeps the first line clear of the copy button */}
            <pre className="rounded-md border bg-muted/50 p-3 pr-10 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap">
              {log.log_message || '—'}
            </pre>
            {log.log_message && (
              <CopyButton
                text={log.log_message}
                copyLabel={t`Copy message`}
                copiedLabel={t`Message copied`}
                // Offset by half the spare height of a one-line block: centred on
                // a single line, pinned to the top corner on longer messages
                buttonClassName="absolute top-2 right-2"
              />
            )}
          </div>
        </section>

        {log.booking_nr && (
          <section className="space-y-2">
            <h3 className="text-sm font-medium">
              <Trans>Other logs for reservation {log.booking_nr}</Trans>
            </h3>
            {relatedQuery.isPending ? (
              // One placeholder per row, shaped like a row: status, time,
              // type, event
              <ul className="space-y-0.5" aria-hidden="true">
                {Array.from({ length: RELATED_LOGS_SKELETON_ROWS }, (_, i) => (
                  <li key={i} className="flex items-center gap-2 py-1.5">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-0.5">
                {relatedLogs.map((related) => (
                  <li key={related.id}>
                    <button
                      type="button"
                      aria-current={related.id === log.id}
                      onClick={() => onSelect(related.id)}
                      className={cn(
                        'group/related flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        related.id === log.id && 'font-medium'
                      )}
                    >
                      <StatusCell status={related.status} />
                      <time className="text-xs text-muted-foreground tabular-nums">
                        {dayjs(related.logged_at).format('DD.MM HH:mm')}
                      </time>
                      <TypeCell type={related.type} />
                      <span className="truncate underline-offset-4 group-hover/related:underline">
                        {related.event}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="cursor-pointer rounded-sm text-sm text-foreground underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() =>
                log.booking_nr && onShowAllForBooking(log.booking_nr)
              }
            >
              <Trans>Show all</Trans>
            </button>
          </section>
        )}
      </DrawerBody>
    </>
  );
}
