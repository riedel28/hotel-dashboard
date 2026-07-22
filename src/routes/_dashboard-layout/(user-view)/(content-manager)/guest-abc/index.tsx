import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { BookOpenIcon, PlusIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { guestAbcQueryOptions } from '@/api/guest-abc';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { AddEntryModal } from './-components/add-entry-modal';
import { LetterNav } from './-components/letter-nav';
import { LetterSection } from './-components/letter-section';
import { groupByLetter } from './-components/types';
import { useStickyTop } from './-hooks/use-sticky-top';

function GuestABCPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Guest ABC`);

  const [addOpen, setAddOpen] = useState(false);

  const [barRef, stuck] = useStickyTop<HTMLDivElement>();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    data: entries = [],
    isFetching,
    isPending
  } = useQuery(guestAbcQueryOptions());
  const grouped = groupByLetter(entries);

  // Only treat as empty once the query has settled, so the initial load
  // doesn't flash the empty state.
  const isEmpty = !isPending && entries.length === 0;

  const addEntryButton = (
    <Button onClick={() => setAddOpen(true)}>
      <PlusIcon />
      <Trans>Add entry</Trans>
    </Button>
  );

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Content Manager</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Guest ABC</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold">
          <Trans>Guest ABC</Trans>
        </h1>
        {stuck || isEmpty ? null : addEntryButton}
      </div>

      <LetterNav
        containerRef={barRef}
        entries={grouped}
        sectionRefs={sectionRefs}
        isLoading={isFetching}
        stuck={stuck}
      />

      {isEmpty && (
        <Empty className="mt-6 border max-w-xl">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenIcon />
            </EmptyMedia>
            <EmptyTitle>
              <Trans>No entries yet</Trans>
            </EmptyTitle>
            <EmptyDescription>
              <Trans>
                Guest ABC entries help guests find hotel information from A to
                Z. Add your first entry to get started.
              </Trans>
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>{addEntryButton}</EmptyContent>
        </Empty>
      )}

      {stuck ? (
        <div className="sticky top-20 z-20 flex h-0 items-start justify-end">
          {addEntryButton}
        </div>
      ) : null}

      {grouped.map(([letter, items]) =>
        items.length === 0 ? null : (
          <LetterSection
            key={letter}
            letter={letter}
            items={items}
            isLoading={isFetching}
            sectionRefs={sectionRefs}
          />
        )
      )}

      <AddEntryModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(content-manager)/guest-abc/'
)({
  component: GuestABCPage
});
