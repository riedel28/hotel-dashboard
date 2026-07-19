import { Trans, useLingui } from '@lingui/react/macro';
import {
  CheckIcon,
  CircleDashedIcon,
  CloudIcon,
  Loader2Icon,
  MinusIcon,
  RotateCwIcon,
  ServerIcon,
  XIcon
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type StepStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

interface TestStep {
  id: string;
  name: string;
  status: StepStatus;
  durationMs?: number;
  error?: string;
}

export interface TestConnectionConfig {
  mode: 'pms' | 'ship';
  shipType: 'stp' | 'https';
  host: string;
  port: string;
  shipUrl: string;
}

export interface TestConnectionResult {
  passed: boolean;
  finishedAt: Date;
}

interface TestConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: TestConnectionConfig;
  onFinished?: (result: TestConnectionResult) => void;
}

function formatDuration(ms: number) {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function TestConnectionDialog({
  open,
  onOpenChange,
  config,
  onFinished
}: TestConnectionDialogProps) {
  const { t, i18n } = useLingui();

  const [steps, setSteps] = React.useState<TestStep[]>([]);
  const [phase, setPhase] = React.useState<'running' | 'done'>('running');
  const [finishedAt, setFinishedAt] = React.useState<Date | null>(null);
  const runIdRef = React.useRef(0);

  const buildSteps = React.useCallback((): TestStep[] => {
    const step = (id: string, name: string): TestStep => ({
      id,
      name,
      status: 'pending'
    });

    if (config.mode === 'pms') {
      return [
        step('tcp', t`TCP connection`),
        step('handshake', t`PMS interface handshake`)
      ];
    }
    if (config.shipType === 'https') {
      return [
        step('tcp', t`TCP connection`),
        step('tls', t`TLS certificate`),
        step('auth', t`Authentication`),
        step('ship', t`SHIP handshake`)
      ];
    }
    return [
      step('tcp', t`TCP connection`),
      step('auth', t`Authentication`),
      step('ship', t`SHIP handshake`)
    ];
  }, [config, t]);

  const mockErrorFor = React.useCallback(
    (stepId: string): string => {
      switch (stepId) {
        case 'tcp':
          return t`Connection timed out after 5000 ms — host unreachable.`;
        case 'tls':
          return t`TLS handshake failed: certificate is self-signed or expired.`;
        case 'auth':
          return t`401 Unauthorized — check username and password.`;
        case 'ship':
          return t`SHIP handshake rejected: unsupported protocol version.`;
        default:
          return t`No response from the PMS interface.`;
      }
    },
    [t]
  );

  const runTests = React.useCallback(async () => {
    const runId = ++runIdRef.current;
    const initialSteps = buildSteps();
    setSteps(initialSteps);
    setPhase('running');
    setFinishedAt(null);

    let failed = false;
    for (const [index, stepDef] of initialSteps.entries()) {
      if (runIdRef.current !== runId) return;

      if (failed) {
        setSteps((prev) =>
          prev.map((s, i) => (i === index ? { ...s, status: 'skipped' } : s))
        );
        continue;
      }

      setSteps((prev) =>
        prev.map((s, i) => (i === index ? { ...s, status: 'running' } : s))
      );

      // Simulated check until the backend endpoint exists;
      // each step randomly fails so every outcome is demoable
      const durationMs = 350 + Math.random() * 900;
      await sleep(durationMs);
      if (runIdRef.current !== runId) return;

      const stepPassed = Math.random() >= 0.35;
      if (!stepPassed) {
        failed = true;
        const error = mockErrorFor(stepDef.id);
        setSteps((prev) =>
          prev.map((s, i) =>
            i === index ? { ...s, status: 'failed', durationMs, error } : s
          )
        );
        continue;
      }

      setSteps((prev) =>
        prev.map((s, i) =>
          i === index ? { ...s, status: 'passed', durationMs } : s
        )
      );
    }

    if (runIdRef.current !== runId) return;
    const at = new Date();
    setPhase('done');
    setFinishedAt(at);
    onFinished?.({ passed: !failed, finishedAt: at });
  }, [buildSteps, mockErrorFor, onFinished]);

  React.useEffect(() => {
    if (open) {
      runTests();
    } else {
      // Abort any in-flight run when the dialog closes
      runIdRef.current++;
    }
  }, [open, runTests]);

  const passedCount = steps.filter((s) => s.status === 'passed').length;
  const failedCount = steps.filter((s) => s.status === 'failed').length;
  const allPassed = phase === 'done' && failedCount === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Top-anchored so height changes (error details) grow downward instead
          of re-centering the whole dialog */}
      <DialogContent className="top-[15vh] translate-y-0">
        <DialogHeader>
          <DialogTitle>
            <Trans>Test provider configuration</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Checks the connection to SALTO ProAccess Space using the current
              form values.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <EndpointNode
              icon={<CloudIcon className="size-5" aria-hidden="true" />}
              label="Our server"
            />

            <ConnectionLine phase={phase} allPassed={allPassed} />

            {phase === 'running' ? (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background dark:bg-input/30 text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
              </div>
            ) : (
              <StatusDisc ok={allPassed} className="size-9" />
            )}

            <ConnectionLine phase={phase} allPassed={allPassed} />

            <EndpointNode
              icon={<ServerIcon className="size-5" aria-hidden="true" />}
              label="SALTO"
            />
          </div>
        </div>

        <ul className="divide-y divide-border/60 rounded-xl border border-border/60">
          {steps.map((step) => (
            <li key={step.id} className="flex flex-col gap-2 px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <StepStatusIcon status={step.status} />
                <span
                  className={cn(
                    'flex-1 text-sm font-medium',
                    step.status === 'pending' || step.status === 'skipped'
                      ? 'text-muted-foreground'
                      : 'text-foreground'
                  )}
                >
                  {step.name}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {step.status === 'skipped' ? (
                    <Trans>Skipped</Trans>
                  ) : step.durationMs !== undefined ? (
                    formatDuration(step.durationMs)
                  ) : null}
                </span>
              </div>
              {step.status === 'failed' && step.error && (
                <div className="ml-7 flex items-center gap-2 rounded-lg border border-rose-200/70 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-800 dark:border-rose-800/30 dark:bg-rose-800/20 dark:text-rose-300">
                  <span className="flex-1">{step.error}</span>
                  <CopyButton
                    text={step.error}
                    size="icon-xs"
                    className="-my-0.5 -mr-1"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>

        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm',
            phase === 'running'
              ? 'border-border/60 bg-muted/30 text-muted-foreground'
              : allPassed
                ? 'border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-800/30 dark:bg-emerald-800/20 dark:text-emerald-300'
                : 'border-rose-200/70 bg-rose-50 text-rose-800 dark:border-rose-800/30 dark:bg-rose-800/20 dark:text-rose-300'
          )}
        >
          {phase === 'running' ? (
            <Loader2Icon className="size-4.5 shrink-0 animate-spin" />
          ) : (
            <StatusDisc ok={allPassed} className="size-4.5" />
          )}
          <span className="flex-1 font-medium">
            {phase === 'running' ? (
              <Trans>
                Running tests… ({passedCount}/{steps.length})
              </Trans>
            ) : allPassed ? (
              <Trans>
                All tests passed ({passedCount}/{steps.length})
              </Trans>
            ) : (
              <Trans>
                {failedCount} of {steps.length} tests failed
              </Trans>
            )}
          </span>
          {finishedAt && (
            <span className="text-xs tabular-nums opacity-70">
              {i18n.date(finishedAt, { timeStyle: 'short' })}
            </span>
          )}
        </div>

        <DialogFooter>
          {phase === 'running' ? (
            <DialogClose render={<Button variant="outline" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
          ) : (
            <>
              <Button variant="secondary" onClick={runTests}>
                <RotateCwIcon data-icon="inline-start" />
                <Trans>Run again</Trans>
              </Button>
              <DialogClose render={<Button />}>
                <Trans>Close</Trans>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EndpointNode({
  icon,
  label
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center gap-2 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-background dark:bg-input/30 text-foreground/70">
        {icon}
      </div>
      <span className="text-xs leading-tight font-medium">{label}</span>
    </div>
  );
}

function StatusDisc({ ok, className }: { ok: boolean; className?: string }) {
  const Icon = ok ? CheckIcon : XIcon;
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full text-rose-50 dark:text-rose-200',
        ok
          ? 'bg-emerald-500 dark:bg-emerald-600'
          : 'bg-rose-500 dark:bg-rose-900',
        className
      )}
    >
      <Icon className="size-[55%]" strokeWidth={3} aria-hidden="true" />
    </span>
  );
}

function ConnectionLine({
  phase,
  allPassed
}: {
  phase: 'running' | 'done';
  allPassed: boolean;
}) {
  return (
    <div
      className={cn(
        'h-0.5 flex-1 rounded-full',
        phase === 'running' &&
          'animate-connection-dash bg-[repeating-linear-gradient(90deg,var(--color-muted-foreground)_0px,var(--color-muted-foreground)_5px,transparent_5px,transparent_12px)]',
        phase === 'done' &&
          (allPassed
            ? 'bg-emerald-500 dark:bg-emerald-800'
            : 'bg-rose-500/30 dark:bg-rose-900')
      )}
    />
  );
}

function StepStatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'running':
      return <Loader2Icon className="size-4.5 animate-spin text-primary" />;
    case 'passed':
      return <StatusDisc ok className="size-4.5" />;
    case 'failed':
      return <StatusDisc ok={false} className="size-4.5" />;
    case 'skipped':
      return (
        <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-muted">
          <MinusIcon
            className="size-3 text-muted-foreground"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </span>
      );
    default:
      return <CircleDashedIcon className="size-4.5 text-muted-foreground/50" />;
  }
}
