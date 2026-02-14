import { Trans } from '@lingui/react/macro';
import { type MonitoringStatus } from 'shared/types/monitoring';
import { cn } from '@/lib/utils';

interface StatusCellProps {
  status: MonitoringStatus;
}

export function StatusCell({ status }: StatusCellProps) {
  const isSuccess = status === 'success';

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border border-foreground/10 px-2 py-0.5 text-xs font-medium tracking-wide',
          isSuccess
            ? 'bg-badge-success text-badge-success-foreground'
            : 'bg-badge-destructive text-badge-destructive-foreground'
        )}
        role="status"
      >
        <span className="relative flex size-1.5">
          {!isSuccess && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-badge-destructive-foreground/60 duration-[1.5s]" />
          )}
          <span
            className={cn(
              'relative inline-flex size-1.5 rounded-full',
              isSuccess
                ? 'bg-badge-success-foreground'
                : 'bg-badge-destructive-foreground'
            )}
          />
        </span>
        {isSuccess ? <Trans>OK</Trans> : <Trans>Error</Trans>}
      </div>
    </div>
  );
}
