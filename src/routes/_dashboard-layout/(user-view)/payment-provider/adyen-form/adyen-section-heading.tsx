import type { ReactNode } from 'react';

export function AdyenSectionHeading({
  id,
  title,
  description
}: {
  id?: string;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className="flex max-w-xs flex-col gap-1">
      <h2 id={id} tabIndex={-1} className="text-[15px] font-semibold">
        {title}
      </h2>
      <p className="text-sm text-pretty text-muted-foreground">{description}</p>
    </div>
  );
}
