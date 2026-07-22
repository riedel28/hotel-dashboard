import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { AddEntryModal } from './-components/add-entry-modal';
import { LetterNav } from './-components/letter-nav';
import { LetterSection } from './-components/letter-section';
import type { Entry, GuestAbcData } from './-components/types';
import { useStickyTop } from './-hooks/use-sticky-top';
import guestAbcData from './guest-abc-data.json';

// Fake latency for the simulated refetch after a mutation.
const REFETCH_DELAY_MS = 900;

function GuestABCPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Guest ABC`);

  const [data, setData] = useState<GuestAbcData>(guestAbcData);
  const [addOpen, setAddOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [barRef, stuck] = useStickyTop<HTMLDivElement>();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleAddEntry = (letter: string, entry: Entry) => {
    setData((prev) => ({
      ...prev,
      [letter]: [...(prev[letter] ?? []), entry]
    }));
    toast.info(
      <span>
        <Trans>
          Entry <span className="font-semibold">{entry.title}</span> was added
        </Trans>
      </span>
    );
  };

  // Simulate refetching the list from the server after a mutation.
  const refetch = () => {
    setIsFetching(true);
    window.setTimeout(() => setIsFetching(false), REFETCH_DELAY_MS);
  };

  const handleUpdateEntry = (letter: string, index: number, entry: Entry) => {
    setData((prev) => ({
      ...prev,
      [letter]: (prev[letter] ?? []).map((e, i) => (i === index ? entry : e))
    }));
    toast.success(
      <span>
        <Trans>
          Entry <span className="font-semibold">{entry.title}</span> was updated
        </Trans>
      </span>
    );
    refetch();
  };

  const entries = Object.entries(data);

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
        {stuck ? null : addEntryButton}
      </div>

      <LetterNav
        containerRef={barRef}
        entries={entries}
        sectionRefs={sectionRefs}
        stuck={stuck}
      />

      {stuck ? (
        <div className="sticky top-20 z-20 flex h-0 items-start justify-end">
          {addEntryButton}
        </div>
      ) : null}

      {entries.map(([letter, items]) =>
        items.length === 0 ? null : (
          <LetterSection
            key={letter}
            letter={letter}
            items={items}
            isFetching={isFetching}
            sectionRefs={sectionRefs}
            onUpdateEntry={handleUpdateEntry}
          />
        )
      )}

      <AddEntryModal
        open={addOpen}
        onOpenChange={setAddOpen}
        letters={Object.keys(data)}
        onAdd={handleAddEntry}
      />
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(content-manager)/guest-abc/'
)({
  component: GuestABCPage
});
