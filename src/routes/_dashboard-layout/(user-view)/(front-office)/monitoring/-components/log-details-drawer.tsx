import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronDownIcon, ChevronUpIcon, ListFilterIcon } from 'lucide-react';
import type { MonitoringLog } from 'shared/types/monitoring';

import {
  monitoringLogQueryOptions,
  monitoringQueryOptions
} from '@/api/monitoring';
import { DetailsDrawer } from '@/components/details-drawer';
import { ReservationLink } from '@/components/reservation-link';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { DrawerBody, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { StatusCell } from './cells/status-cell';
import { TypeCell } from './cells/type-cell';

const RELATED_LOGS_COUNT = 5;
const RELATED_LOGS_SKELETON_ROWS = 3;

interface LogDetailsDrawerProps {
  /** The open log; the drawer is closed while undefined. */
  logId?: number;
  /** Logs of the current table page. */
  pageLogs: MonitoringLog[];
  onSelect: (logId: number) => void;
  onClose: () => void;
  onShowReservationLogs: (bookingNr: string) => void;
}

export function LogDetailsDrawer({
  logId,
  pageLogs,
  onSelect,
  onClose,
  onShowReservationLogs
}: LogDetailsDrawerProps) {
  return (
    <DetailsDrawer
      openId={logId}
      items={pageLogs}
      queryOptions={monitoringLogQueryOptions}
      onSelect={onSelect}
      onClose={onClose}
      // Narrow enough to leave the table's status, date, type and event
      // columns in view beside it
      className="sm:max-w-md"
      loadingText={<Trans>Loading log…</Trans>}
      notFoundTitle={<Trans>Log not found</Trans>}
      notFoundText={<Trans>This log does not exist or was removed.</Trans>}
    >
      {(log) => (
        <LogDetails
          log={log}
          pageLogs={pageLogs}
          onSelect={onSelect}
          onShowReservationLogs={onShowReservationLogs}
        />
      )}
    </DetailsDrawer>
  );
}

function LogDetails({
  log,
  pageLogs,
  onSelect,
  onShowReservationLogs
}: {
  log: MonitoringLog;
  pageLogs: MonitoringLog[];
  onSelect: (logId: number) => void;
  onShowReservationLogs: (bookingNr: string) => void;
}) {
  const { t } = useLingui();

  return (
    <>
      <DrawerHeader className="space-y-2">
        {/* Only the title row shares its line with the step and close
            buttons */}
        <DrawerTitle className="pr-28">{log.event}</DrawerTitle>
        <PageStepper log={log} pageLogs={pageLogs} onSelect={onSelect} />
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
                    <ReservationLink
                      reservationId={log.reservation_id}
                      bookingNr={log.booking_nr}
                    />
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
          <RelatedLogs
            bookingNr={log.booking_nr}
            currentLogId={log.id}
            onSelect={onSelect}
            onShowAll={onShowReservationLogs}
          />
        )}
      </DrawerBody>
    </>
  );
}

/**
 * Steps to the previous or next log of the table page, as ↑/↓ do, for the
 * pointer and for phones without keys. Absent for a log not on the page.
 */
function PageStepper({
  log,
  pageLogs,
  onSelect
}: {
  log: MonitoringLog;
  pageLogs: MonitoringLog[];
  onSelect: (logId: number) => void;
}) {
  const { t } = useLingui();
  const index = pageLogs.findIndex((pageLog) => pageLog.id === log.id);

  if (index === -1) {
    return null;
  }

  const previous = pageLogs[index - 1];
  const next = pageLogs[index + 1];

  return (
    // Left of the drawer's close button
    <div className="absolute top-4 right-14 flex gap-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!previous}
        aria-label={t`Previous log`}
        title={t`Previous log (↑)`}
        onClick={() => previous && onSelect(previous.id)}
      >
        <ChevronUpIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!next}
        aria-label={t`Next log`}
        title={t`Next log (↓)`}
        onClick={() => next && onSelect(next.id)}
      >
        <ChevronDownIcon />
      </Button>
    </div>
  );
}

/** The latest logs of the same reservation, the open one marked. */
function RelatedLogs({
  bookingNr,
  currentLogId,
  onSelect,
  onShowAll
}: {
  bookingNr: string;
  currentLogId: number;
  onSelect: (logId: number) => void;
  onShowAll: (bookingNr: string) => void;
}) {
  const relatedQuery = useQuery(
    monitoringQueryOptions({
      booking_nr: bookingNr,
      per_page: RELATED_LOGS_COUNT
    })
  );

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">
        <Trans>Logs for reservation {bookingNr}</Trans>
      </h3>
      {relatedQuery.isPending ? (
        // One placeholder per row, shaped like a row: status, time, type,
        // event
        <ul className="-mx-2 space-y-0.5" aria-hidden="true">
          {Array.from({ length: RELATED_LOGS_SKELETON_ROWS }, (_, i) => (
            <li key={i} className="flex items-center gap-2 px-2 py-1.5">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-32" />
            </li>
          ))}
        </ul>
      ) : (
        // Pulled out by the rows' padding, so their content lines up with the
        // heading while the open one's tint reaches past it
        <ul className="-mx-2 space-y-0.5">
          {relatedQuery.data?.index.map((related) => (
            <li key={related.id}>
              <button
                type="button"
                aria-current={related.id === currentLogId}
                onClick={() => onSelect(related.id)}
                className={cn(
                  'group/related flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring',
                  related.id === currentLogId &&
                    'bg-muted font-medium hover:bg-muted'
                )}
              >
                <StatusCell status={related.status} />
                <time
                  dateTime={dayjs(related.logged_at).toISOString()}
                  className="shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums"
                >
                  {dayjs(related.logged_at).format('DD.MM HH:mm:ss')}
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
      <Button variant="outline" size="sm" onClick={() => onShowAll(bookingNr)}>
        <ListFilterIcon />
        <Trans>Show all logs for {bookingNr}</Trans>
      </Button>
    </section>
  );
}
