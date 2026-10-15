import type { ReactNode } from 'react';

/** A titled list of label–value rows, as the details drawers show them. */
export function DetailSection({
  title,
  children
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {/* A fixed label column keeps the values aligned across sections */}
      <dl className="grid grid-cols-[9rem_1fr] gap-x-6 gap-y-2 text-sm">
        {children}
      </dl>
    </section>
  );
}

export function DetailRow({
  label,
  children
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 wrap-break-word">{children}</dd>
    </>
  );
}
