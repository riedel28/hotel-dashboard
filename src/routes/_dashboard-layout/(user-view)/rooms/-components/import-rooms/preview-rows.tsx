import { Trans, useLingui } from '@lingui/react/macro';
import { ArrowRightIcon } from 'lucide-react';
import { Fragment, type ReactNode, useState } from 'react';
import type { RoomImportRow } from 'shared/types/room-imports';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataGridSegmentedFilter } from '@/components/ui/data-grid-segmented-filter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { paginate } from '@/lib/paginate';

import { fieldLabels, rowErrors, statusLabels } from './messages';

const PAGE_SIZE = 50;

// No filter shows every row of the file
type RowFilter = 'changes' | 'errors';

const matches: Record<RowFilter, (row: RoomImportRow) => boolean> = {
  changes: (row) => row.status === 'new' || row.status === 'changed',
  errors: (row) => row.status === 'error'
};

// The summary tiles' colors; a change is plain text, as its tile is
const statusColors: Record<RoomImportRow['status'], string> = {
  new: 'text-emerald-600 dark:text-emerald-400',
  changed: '',
  unchanged: 'text-muted-foreground',
  error: 'text-danger'
};

// A filter's name with how many rows it shows
const counted = (label: ReactNode, count: number) => (
  <>
    {label}
    <span className="ml-1.5 text-muted-foreground tabular-nums">{count}</span>
  </>
);

function NewTypeBadge() {
  return (
    <Badge variant="outline" size="xs" color="yellow">
      <Trans>New type</Trans>
    </Badge>
  );
}

/** What one row of the file does: its errors, its changes, or what it holds. */
function RowDetails({ row }: { row: RoomImportRow }) {
  const { t } = useLingui();

  if (row.status === 'error') {
    return (
      <ul className="space-y-0.5 text-danger">
        {row.errors.map((code) => (
          <li key={code}>{t(rowErrors[code])}</li>
        ))}
      </ul>
    );
  }

  if (row.status === 'changed') {
    return (
      <dl className="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-0.5">
        {row.changes.map(({ field, from, to }) => (
          <Fragment key={field}>
            <dt className="text-muted-foreground">{t(fieldLabels[field])}</dt>
            <dd className="flex flex-wrap items-center gap-x-1.5">
              <span className="text-muted-foreground line-through">
                {from ?? '—'}
              </span>
              <ArrowRightIcon
                aria-label={t`becomes`}
                className="size-3 shrink-0 text-muted-foreground"
              />
              <span className="font-medium">{to ?? '—'}</span>
              {field === 'room_type' && row.is_new_type && <NewTypeBadge />}
            </dd>
          </Fragment>
        ))}
      </dl>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-x-1.5 text-muted-foreground">
      {[
        row.name,
        row.room_type,
        row.floor === null ? null : t`Floor ${row.floor}`
      ]
        .filter(Boolean)
        .join(' · ')}
      {row.is_new_type && <NewTypeBadge />}
    </span>
  );
}

/** The rows of the file with what each will do, filtered and paged here. */
export function PreviewRows({ rows }: { rows: RoomImportRow[] }) {
  const { t } = useLingui();
  // Rows that change nothing are hidden until asked for
  const [filter, setFilter] = useState<RowFilter | undefined>('changes');
  const [pageIndex, setPageIndex] = useState(0);

  const count = (name: RowFilter) => rows.filter(matches[name]).length;
  const errorCount = count('errors');
  const page = paginate(
    filter ? rows.filter(matches[filter]) : rows,
    pageIndex,
    PAGE_SIZE
  );

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">
          <Trans>Rows in the file</Trans>
        </h3>
        <DataGridSegmentedFilter
          label={t`Rows shown`}
          value={filter}
          onValueChange={(next) => {
            setFilter(next);
            setPageIndex(0);
          }}
          allLabel={counted(<Trans>All</Trans>, rows.length)}
          options={[
            {
              value: 'changes',
              label: counted(<Trans>Changes</Trans>, count('changes'))
            },
            {
              value: 'errors',
              label: counted(<Trans>Errors</Trans>, errorCount)
            }
          ]}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">
              <Trans>Line</Trans>
            </TableHead>
            <TableHead className="w-24">
              <Trans>Number</Trans>
            </TableHead>
            <TableHead className="w-28">
              <Trans>Status</Trans>
            </TableHead>
            <TableHead>
              <Trans>Details</Trans>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {page.rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-8 text-center text-muted-foreground"
              >
                <Trans>No rows to show</Trans>
              </TableCell>
            </TableRow>
          )}
          {page.rows.map((row) => (
            <TableRow key={row.line} className="align-top">
              <TableCell className="text-muted-foreground tabular-nums">
                {row.line}
              </TableCell>
              <TableCell className="font-medium">
                {row.room_number || '—'}
              </TableCell>
              <TableCell>
                <span className={statusColors[row.status]}>
                  {t(statusLabels[row.status])}
                </span>
              </TableCell>
              <TableCell className="whitespace-normal">
                <RowDetails row={row} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(errorCount > 0 || page.pageCount > 1) && (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            {errorCount > 0 && <Trans>Rows with errors are skipped.</Trans>}
          </p>
          {page.pageCount > 1 && (
            <div className="flex items-center gap-2">
              <span className="tabular-nums">
                <Trans>
                  Page {page.pageIndex + 1} of {page.pageCount}
                </Trans>
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page.pageIndex === 0}
                onClick={() => setPageIndex(page.pageIndex - 1)}
              >
                <Trans>Previous</Trans>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page.pageIndex >= page.pageCount - 1}
                onClick={() => setPageIndex(page.pageIndex + 1)}
              >
                <Trans>Next</Trans>
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
