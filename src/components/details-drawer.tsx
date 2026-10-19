import { Trans } from '@lingui/react/macro';
import {
  type QueryKey,
  useQuery,
  type UseQueryOptions
} from '@tanstack/react-query';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';

import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';

interface DetailsDrawerProps<
  TItem extends { id: number },
  TQueryKey extends QueryKey
> {
  /** The open item; the drawer is closed while undefined. */
  openId: number | undefined;
  /** The table page behind the drawer: instant content and ↑/↓ navigation. */
  items: TItem[];
  /** Loads one item, for an id not on the page or to refresh it. */
  queryOptions: (id: number) => UseQueryOptions<TItem, Error, TItem, TQueryKey>;
  onSelect: (id: number) => void;
  onClose: () => void;
  loadingText: ReactNode;
  notFoundTitle: ReactNode;
  notFoundText: ReactNode;
  /** The drawer's content for the loaded item. */
  children: (item: TItem) => ReactNode;
  className?: string;
}

/**
 * A side drawer with one item of a table page: opened by id, filled at once
 * from the page and kept fresh by its own query, with ↑/↓ stepping through
 * the page.
 */
export function DetailsDrawer<
  TItem extends { id: number },
  TQueryKey extends QueryKey
>({
  openId,
  items,
  onSelect,
  onClose,
  className,
  ...detailsProps
}: DetailsDrawerProps<TItem, TQueryKey>) {
  // Open with focus on the panel itself, as a dialog opens on its first
  // field: there is no field here, and the close button would otherwise take
  // it and show its focus ring
  const panelRef = useRef<HTMLDivElement>(null);

  // ↑/↓ open the previous or next item of the page and stop at its ends
  useEffect(() => {
    if (openId === undefined) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        return;
      }
      const index = items.findIndex((item) => item.id === openId);
      const next = items[index + (event.key === 'ArrowDown' ? 1 : -1)];
      if (index !== -1 && next) {
        event.preventDefault();
        onSelect(next.id);
      }
    };

    // Capture phase: the open dialog stops arrow keys from bubbling this far
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [items, openId, onSelect]);

  return (
    <Drawer
      open={openId !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <DrawerContent
        ref={panelRef}
        initialFocus={panelRef}
        className={className}
      >
        {openId !== undefined && (
          <Details
            // Remount per item so one's data never shows under another id
            key={openId}
            id={openId}
            items={items}
            {...detailsProps}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Details<TItem extends { id: number }, TQueryKey extends QueryKey>({
  id,
  items,
  queryOptions,
  loadingText,
  notFoundTitle,
  notFoundText,
  children
}: Omit<
  DetailsDrawerProps<TItem, TQueryKey>,
  'openId' | 'onSelect' | 'onClose' | 'className'
> & {
  id: number;
}) {
  const query = useQuery({
    ...queryOptions(id),
    initialData: items.find((item) => item.id === id)
  });

  if (query.data) {
    return children(query.data);
  }

  let title: ReactNode = <Trans>Something went wrong</Trans>;
  let description: ReactNode = query.error?.message;
  if (query.isPending) {
    title = <Skeleton className="h-6 w-40" />;
    description = loadingText;
  } else if (query.error instanceof ApiError && query.error.status === 404) {
    title = notFoundTitle;
    description = notFoundText;
  }

  return (
    <DrawerHeader className="space-y-1 pr-14">
      <DrawerTitle>{title}</DrawerTitle>
      <p className="text-sm font-normal text-muted-foreground">{description}</p>
    </DrawerHeader>
  );
}

/**
 * Steps to the previous or next item of the table page, as ↑/↓ do, for the
 * pointer and for phones without keys. Absent for an item not on the page.
 */
export function DetailsDrawerStepper({
  currentId,
  items,
  onSelect,
  previousLabel,
  nextLabel
}: {
  currentId: number;
  items: { id: number }[];
  onSelect: (id: number) => void;
  previousLabel: string;
  nextLabel: string;
}) {
  const index = items.findIndex((item) => item.id === currentId);

  if (index === -1) {
    return null;
  }

  const previous = items[index - 1];
  const next = items[index + 1];

  return (
    <DrawerFooter className="flex-row items-center gap-1 py-3 sm:justify-start">
      <Button
        variant="outline"
        size="icon-sm"
        disabled={!previous}
        aria-label={previousLabel}
        title={`${previousLabel} (↑)`}
        onClick={() => previous && onSelect(previous.id)}
      >
        <ChevronUpIcon />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        disabled={!next}
        aria-label={nextLabel}
        title={`${nextLabel} (↓)`}
        onClick={() => next && onSelect(next.id)}
      >
        <ChevronDownIcon />
      </Button>
    </DrawerFooter>
  );
}
