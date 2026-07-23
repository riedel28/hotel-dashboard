import type { ReactNode } from 'react';

export function SectionHeading({
  id,
  title,
  description
}: {
  id?: string;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 id={id} className="text-[15px] font-medium">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
