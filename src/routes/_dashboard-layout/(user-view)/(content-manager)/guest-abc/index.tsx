import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';
import { Edit2Icon, Loader2Icon, PlusIcon, TrashIcon } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import guestAbcData from './guest-abc-data.json';

type Entry = { title: string; description: string };

const entrySchema = z.object({
  letter: z.string().min(1, 'Letter is required'),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required')
});

type EntryFormValues = z.infer<typeof entrySchema>;

// Distance from the top of the scroll container at which a section counts as
// active. Matches the `scroll-mt-24` (6rem = 96px) on each section so a letter
// highlights right as its section lands just below the sticky bar.
const LETTER_SCROLL_OFFSET = 96;

function GuestABCPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Guest ABC`);

  const [data, setData] = useState<Record<string, Entry[]>>(guestAbcData);
  const [addOpen, setAddOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

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
    window.setTimeout(() => setIsFetching(false), 900);
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

  const viewportRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setEdges({
        left: scrollLeft > 1,
        right: scrollLeft + clientWidth < scrollWidth - 1
      });
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, []);

  const maskImage =
    edges.left || edges.right
      ? `linear-gradient(to right, ${
          edges.left ? 'transparent, black 1.5rem' : 'black'
        }, ${edges.right ? 'black calc(100% - 1.5rem), transparent' : 'black'})`
      : undefined;

  const stickyRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useLayoutEffect(() => {
    const bar = stickyRef.current;
    const root = bar?.closest('main');
    if (!bar || !root) return;

    const update = () => {
      setStuck(
        bar.getBoundingClientRect().top <= root.getBoundingClientRect().top + 1
      );
    };

    update();
    root.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      root.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Scroll-spy: highlight the letter whose section is currently under the bar.
  useLayoutEffect(() => {
    const root = stickyRef.current?.closest('main');
    if (!root) return;

    const update = () => {
      const rootTop = root.getBoundingClientRect().top;
      const entries = Object.entries(sectionRefs.current);
      // Default to the first section so something is highlighted at the top.
      let active: string | null = entries[0]?.[0] ?? null;
      for (const [letter, el] of entries) {
        if (
          el &&
          el.getBoundingClientRect().top - rootTop <= LETTER_SCROLL_OFFSET
        ) {
          active = letter;
        }
      }
      setActiveLetter(active);
    };

    update();
    root.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      root.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scrollToLetter = (letter: string) => {
    const el = sectionRefs.current[letter];
    const root = el?.closest('main');
    if (!el || !root) return;
    const top =
      root.scrollTop +
      el.getBoundingClientRect().top -
      root.getBoundingClientRect().top -
      LETTER_SCROLL_OFFSET;
    root.scrollTo({ top, behavior: 'smooth' });
    setActiveLetter(letter);
  };

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
        {!stuck && (
          <Button onClick={() => setAddOpen(true)}>
            <PlusIcon />
            <Trans>Add entry</Trans>
          </Button>
        )}
      </div>

      <div
        ref={stickyRef}
        className={cn(
          'sticky -top-4 z-10 mb-6 -mx-4 border-b border-transparent bg-background px-4 pt-3 pb-3 transition-colors md:-mx-6 md:px-6',
          stuck && 'border-border'
        )}
      >
        <ScrollArea
          viewportRef={viewportRef}
          style={{ maskImage, WebkitMaskImage: maskImage }}
        >
          <div className="flex gap-4">
            {Object.entries(data).map(([letter, items]) => (
              <button
                key={letter}
                type="button"
                data-letter={letter}
                data-active={activeLetter === letter || undefined}
                disabled={items.length === 0}
                onClick={() => scrollToLetter(letter)}
                className={cn(
                  'relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border shadow-xs bg-accent text-lg font-medium text-accent-foreground uppercase disabled:cursor-default',
                  items.length === 0 && 'opacity-40'
                )}
              >
                {letter}
                <span className="absolute text-[9px] text-muted-foreground/90 right-1 bottom-0.5 ">
                  {items.length || null}
                </span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {stuck && (
        <div className="sticky top-20 z-20 flex h-0 items-start justify-end">
          <Button onClick={() => setAddOpen(true)}>
            <PlusIcon />
            <Trans>Add entry</Trans>
          </Button>
        </div>
      )}

      {Object.entries(data).map(([letter, items]) => {
        if (items.length === 0) return null;

        return (
          <div
            key={letter}
            ref={(el) => {
              sectionRefs.current[letter] = el;
            }}
            className="scroll-mt-24 p-4 flex flex-col gap-4 max-w-lg"
          >
            <span className="text-2xl text-foreground/80 font-semibold uppercase">
              {letter}
            </span>

            {items.map((entry, index) =>
              isFetching ? (
                <EntryCardSkeleton key={index} />
              ) : (
                <EntryCard
                  key={index}
                  title={entry.title}
                  description={entry.description}
                  onUpdate={(updated) =>
                    handleUpdateEntry(letter, index, updated)
                  }
                />
              )
            )}
          </div>
        );
      })}

      <AddEntryModal
        open={addOpen}
        onOpenChange={setAddOpen}
        letters={Object.keys(data)}
        onAdd={handleAddEntry}
      />
    </div>
  );
}

function AddEntryModal({
  open,
  onOpenChange,
  letters,
  onAdd
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letters: string[];
  onAdd: (letter: string, entry: Entry) => void;
}) {
  const defaultValues: EntryFormValues = {
    letter: letters[0] ?? '',
    title: '',
    description: ''
  };

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    mode: 'onChange',
    defaultValues
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    }
    // Reset should only run when the dialog opens/closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = (values: EntryFormValues) => {
    onAdd(values.letter, {
      title: values.title.trim(),
      description: values.description.trim()
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Add entry</Trans>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
          <FieldSet className="gap-4">
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="letter"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Letter</Trans>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        className="w-full uppercase"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {letters.map((l) => (
                          <SelectItem key={l} value={l} className="uppercase">
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Title</Trans>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      autoFocus
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Description</Trans>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={field.name}
                      rows={4}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={!form.formState.isValid}>
              <Trans>Add</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EntryCard({
  title,
  description,
  onUpdate
}: {
  title: string;
  description: string;
  onUpdate: (entry: Entry) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDescription, setDraftDescription] = useState(description);

  const startEditing = () => {
    setDraftTitle(title);
    setDraftDescription(description);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    // Simulate a save request so the spinner is visible.
    await new Promise((resolve) => setTimeout(resolve, 800));
    onUpdate({
      title: draftTitle.trim(),
      description: draftDescription.trim()
    });
    setIsUpdating(false);
    setIsEditing(false);
  };

  const canSubmit = draftTitle.trim() !== '' && draftDescription.trim() !== '';

  return (
    <Card className="p-2 group">
      {isEditing ? (
        <CardContent className="p-2 flex flex-col space-y-3">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              rows={4}
              disabled={isUpdating}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={handleUpdate}
              disabled={isUpdating || !canSubmit}
            >
              {isUpdating && <Loader2Icon className="animate-spin" />}
              Update
            </Button>
          </div>
        </CardContent>
      ) : (
        <CardHeader className="p-2">
          <div className="flex justify-between gap-2">
            <CardTitle>{title}</CardTitle>
            <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={startEditing}
              >
                <Edit2Icon className="size-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground"
              >
                <TrashIcon className="size-3.5" />
              </Button>
            </div>
          </div>
          <CardDescription className="line-clamp-2 text-pretty text-[13px]">
            {description}
          </CardDescription>
        </CardHeader>
      )}
    </Card>
  );
}

function EntryCardSkeleton() {
  return (
    <Card className="p-2">
      <CardHeader className="p-2 gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </CardHeader>
    </Card>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(content-manager)/guest-abc/'
)({
  component: GuestABCPage
});
