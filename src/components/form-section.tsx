import type { ReactNode } from 'react';

import { sectionHeadingId } from '@/components/section-nav';

interface FormSectionProps {
  /** DOM id a `SectionNav` entry links to. */
  id: string;
  title: ReactNode;
  description: ReactNode;
  /** The section's fields, laid out beside the heading from lg up. */
  children: ReactNode;
}

/**
 * One titled section of a long form: its heading and description on the left,
 * its fields on the right. Pair with `SectionNav` for a table of contents.
 */
export function FormSection({
  id,
  title,
  description,
  children
}: FormSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={sectionHeadingId(id)}
      className="grid scroll-mt-4 grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]"
    >
      <div className="flex max-w-xs flex-col gap-1">
        <h2
          id={sectionHeadingId(id)}
          tabIndex={-1}
          className="text-[15px] font-semibold"
        >
          {title}
        </h2>
        <p className="text-sm text-pretty text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
