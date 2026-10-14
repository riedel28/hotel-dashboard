import { zodResolver } from '@hookform/resolvers/zod';
import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBlocker } from '@tanstack/react-router';
import {
  ArrowUpIcon,
  ArrowUpRightIcon,
  CopyIcon,
  EyeOffIcon,
  FileTextIcon,
  GripVerticalIcon,
  Loader2Icon,
  PlusIcon
} from 'lucide-react';
import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { cmsVisibility } from 'shared/cms-tree';
import {
  type CmsLocale,
  cmsLocales,
  type CmsNodeType,
  cmsPrimaryLocale,
  cmsSubtitleMaxLength,
  cmsUrlSchema
} from 'shared/types/cms';
import { toast } from 'sonner';
import { z } from 'zod';

import { ApiError } from '@/api/client';
import { type CmsNode, cmsNodesQueryOptions, saveCmsNode } from '@/api/cms';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import {
  childrenOf,
  type CmsForm,
  formToPayload,
  hasText,
  isMissingTranslation,
  lineage,
  localized,
  nodeToForm,
  typeChange,
  type TypeChange
} from '../-lib/cms-content';
import { moveItem, useDragReorder } from '../-lib/use-drag-reorder';
import { ImageField } from './image-field';

interface NodeEditorProps {
  node: CmsNode;
  nodes: CmsNode[];
  // Reports the form as it is typed, for the preview.
  onDraftChange: (draft: CmsForm | null) => void;
  onSelect: (id: number | null) => void;
  onToggleHidden: (node: CmsNode) => void;
  onAddChild: (node: CmsNode, type: CmsNodeType) => void;
  onReorder: (node: CmsNode, index: number) => void;
}

const localeNames: Record<CmsLocale, string> = { de: 'Deutsch', en: 'English' };

function useFormSchema() {
  const { t } = useLingui();
  return React.useMemo(() => {
    const translation = (locale: CmsLocale) =>
      z.object({
        title:
          locale === cmsPrimaryLocale
            ? z
                .string()
                .trim()
                .min(1, t`Title is required`)
            : z.string(),
        subtitle: z
          .string()
          .max(
            cmsSubtitleMaxLength,
            t`At most ${cmsSubtitleMaxLength} characters`
          ),
        body: z.string(),
        url: z
          .string()
          .refine(
            (value) => !value.trim() || cmsUrlSchema.safeParse(value).success,
            t`Enter a URL starting with http:// or https://`
          )
      });
    return z
      .object({
        type: z.enum(['page', 'link']),
        url: z.string(),
        open_mode: z.enum(['in_app', 'system']),
        gallery: z.array(z.string()),
        icon: z.string().nullable(),
        translations: z.object({
          de: translation('de'),
          en: translation('en')
        })
      })
      .superRefine((values, ctx) => {
        if (
          values.type === 'link' &&
          !cmsUrlSchema.safeParse(values.url).success
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['url'],
            message: t`Enter a URL starting with http:// or https://`
          });
        }
      });
  }, [t]);
}

// The selected node's form, saved explicitly. Mounted per node (keyed by id),
// so switching nodes starts a fresh form.
export function NodeEditor({
  node,
  nodes,
  onDraftChange,
  onSelect,
  onToggleHidden,
  onAddChild,
  onReorder
}: NodeEditorProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const schema = useFormSchema();
  const form = useForm<CmsForm>({
    resolver: zodResolver(schema),
    defaultValues: nodeToForm(node),
    mode: 'onTouched'
  });
  const { isDirty } = form.formState;
  const values = useWatch({ control: form.control }) as CmsForm;

  // The version the form was loaded from; a save from it that finds a newer
  // one on the server is answered with 409.
  const version = React.useRef(node.updated_at);
  React.useEffect(() => {
    // Someone saved the node meanwhile (or our own save came back): follow
    // it unless there are local edits — those keep the old version and get
    // the conflict on save.
    if (node.updated_at !== version.current && !form.formState.isDirty) {
      form.reset(nodeToForm(node));
      version.current = node.updated_at;
    }
  }, [node, form]);

  React.useEffect(() => {
    onDraftChange(values);
  }, [values, onDraftChange]);
  React.useEffect(() => () => onDraftChange(null), [onDraftChange]);

  const reloadFromServer = async () => {
    const fresh = await queryClient.fetchQuery({
      ...cmsNodesQueryOptions,
      staleTime: 0
    });
    const latest = fresh.find((n) => n.id === node.id);
    if (latest) {
      version.current = latest.updated_at;
      form.reset(nodeToForm(latest));
    }
  };

  const save = useMutation({
    mutationFn: (formValues: CmsForm) =>
      saveCmsNode(node.id, formToPayload(formValues, version.current)),
    onSuccess: (saved) => {
      version.current = saved.updated_at;
      form.reset(nodeToForm(saved));
      queryClient.setQueryData<CmsNode[]>(
        cmsNodesQueryOptions.queryKey,
        (list) => list?.map((n) => (n.id === saved.id ? saved : n))
      );
      void queryClient.invalidateQueries({
        queryKey: cmsNodesQueryOptions.queryKey
      });
      const title = titleOf(saved);
      toast.success(t`“${title}” saved`);
    },
    // The form keeps what was typed in every case.
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'STALE') {
        toast.error(t`Someone else changed this item meanwhile`, {
          description: t`Reload to see their version. Your edits are kept until then.`,
          action: { label: t`Reload`, onClick: () => void reloadFromServer() },
          duration: Infinity
        });
      } else {
        toast.error(t`Failed to save`, { description: error.message });
      }
    }
  });

  // Saves when valid; whether it worked, for the unsaved-changes dialog.
  const submit = () =>
    new Promise<boolean>((resolve) => {
      void form.handleSubmit(
        (formValues) =>
          save.mutate(formValues, {
            onSuccess: () => resolve(true),
            onError: () => resolve(false)
          }),
        () => {
          toast.error(t`Check the highlighted fields`);
          resolve(false);
        }
      )();
    });

  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) =>
      form.formState.isDirty &&
      !(
        next.pathname === current.pathname &&
        (next.search as { node?: number }).node ===
          (current.search as { node?: number }).node
      ),
    enableBeforeUnload: () => form.formState.isDirty,
    withResolver: true
  });

  // --- Type change ---

  const children = childrenOf(nodes, node.id);
  const [pendingType, setPendingType] = React.useState<TypeChange | null>(null);
  const changeType = (to: CmsNodeType) => {
    const change = typeChange(form.getValues(), to, children.length);
    if (change.kind === 'free') {
      form.setValue('type', to, { shouldDirty: true });
    } else {
      setPendingType(change);
    }
  };

  // --- Languages ---

  const [locale, setLocale] = React.useState<CmsLocale>(cmsPrimaryLocale);
  // Secondary locales whose fields are shown although still empty.
  const [started, setStarted] = React.useState<Set<CmsLocale>>(new Set());
  const errors = form.formState.errors.translations;

  const visibility = cmsVisibility(nodes, node.id);
  const hiddenBy =
    visibility.state === 'hidden_by_parent'
      ? nodes.find((n) => n.id === visibility.ancestorId)
      : undefined;
  const titleOf = (n: CmsNode) =>
    localized(n.translations, cmsPrimaryLocale, 'title').value || t`Untitled`;

  const path = lineage(nodes, node.id).reverse();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-5"
      aria-label={t`Edit item`}
    >
      <Breadcrumb aria-label={t`Path`}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/mobile-cms" search={{}}>
              <Trans>Content</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {path.map((ancestor, index) => (
            <React.Fragment key={ancestor.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0" title={titleOf(ancestor)}>
                {index === path.length - 1 ? (
                  <BreadcrumbPage
                    className="truncate"
                    title={titleOf(ancestor)}
                  >
                    {titleOf(ancestor)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    to="/mobile-cms"
                    search={{ node: ancestor.id }}
                    className="truncate"
                  >
                    {titleOf(ancestor)}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          label={t`Type`}
          value={values.type}
          onValueChange={changeType}
          options={[
            { value: 'page', label: t`Page` },
            { value: 'link', label: t`External link` }
          ]}
        />
        <div className="flex items-center gap-2">
          <Switch
            id="cms-node-visible"
            aria-label={t`Visible to guests`}
            checked={!node.hidden}
            onCheckedChange={() => onToggleHidden(node)}
          />
          <Label htmlFor="cms-node-visible" className="font-normal">
            <Trans>Visible to guests</Trans>
          </Label>
        </div>
      </div>

      {hiddenBy && (
        <Alert variant="warning">
          <EyeOffIcon />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>
              <Trans>
                Guests don’t see this item because “{titleOf(hiddenBy)}” is
                hidden.
              </Trans>
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onSelect(hiddenBy.id)}
            >
              <ArrowUpIcon />
              <Trans>Go to parent</Trans>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {values.type === 'link' ? (
        <div className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="url"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor="cms-url">URL</FieldLabel>
                <Input
                  {...field}
                  id="cms-url"
                  type="url"
                  inputMode="url"
                  placeholder="https://"
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
            name="open_mode"
            render={({ field }) => (
              <Field className="gap-2">
                <FieldLabel id="cms-open-mode">
                  <Trans>Opens in</Trans>
                </FieldLabel>
                {/* Radio cards like the Adyen environment choice. */}
                <RadioGroup
                  aria-labelledby="cms-open-mode"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid w-full grid-cols-2 gap-2"
                >
                  {(
                    [
                      ['in_app', t`In-app browser`],
                      ['system', t`System browser`]
                    ] as const
                  ).map(([value, label]) => (
                    <Label
                      key={value}
                      htmlFor={`cms-open-mode-${value}`}
                      className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted dark:bg-input/30"
                    >
                      <RadioGroupItem
                        value={value}
                        id={`cms-open-mode-${value}`}
                      />
                      {label}
                    </Label>
                  ))}
                </RadioGroup>
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="icon"
            render={({ field }) => (
              <Field className="gap-2">
                <FieldLabel>
                  <Trans>Image or icon</Trans>
                  <Optional />
                </FieldLabel>
                <ImageField
                  max={1}
                  value={field.value ? [field.value] : []}
                  onChange={(ids) => field.onChange(ids[0] ?? null)}
                />
              </Field>
            )}
          />
        </div>
      ) : (
        <Controller
          control={form.control}
          name="gallery"
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel>
                <Trans>Images</Trans>
              </FieldLabel>
              <FieldDescription>
                <Trans>
                  JPG, PNG or WebP up to 2 MB. Drag to change the order.
                </Trans>
              </FieldDescription>
              <ImageField value={field.value} onChange={field.onChange} />
            </Field>
          )}
        />
      )}

      <Tabs
        value={locale}
        onValueChange={(value) => setLocale(value as CmsLocale)}
      >
        {/* Pills, like the tabs on a property's admin page. */}
        <TabsList variant="pills">
          {cmsLocales.map((code) => {
            const missing = isMissingTranslation(values.translations, code);
            const invalid = !!errors?.[code];
            return (
              <TabsTrigger key={code} value={code} className="gap-2">
                {localeNames[code]}
                {code === cmsPrimaryLocale && (
                  <span className="-ml-1 font-normal text-muted-foreground">
                    (<Trans>main</Trans>)
                  </span>
                )}
                {(missing || invalid) && (
                  <span
                    className={cn(
                      'size-1.25 rounded-full',
                      invalid ? 'bg-danger' : 'bg-amber-500'
                    )}
                    aria-label={
                      invalid ? t`Has errors` : t`Translation missing`
                    }
                    title={invalid ? t`Has errors` : t`Translation missing`}
                  />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {cmsLocales.map((code) => {
          const isPrimary = code === cmsPrimaryLocale;
          const empty =
            !isPrimary &&
            !hasText(values.translations[code]) &&
            !started.has(code);
          return (
            <TabsContent key={code} value={code} className="pt-2">
              {empty ? (
                <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-4 text-sm">
                  <p className="text-muted-foreground">
                    <Trans>
                      No translation yet. The app shows the German text in its
                      place.
                    </Trans>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const primary = form.getValues(
                          `translations.${cmsPrimaryLocale}`
                        );
                        form.setValue(
                          `translations.${code}`,
                          { ...primary },
                          { shouldDirty: true }
                        );
                      }}
                    >
                      <CopyIcon />
                      <Trans>Copy from German</Trans>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setStarted((set) => new Set(set).add(code))
                      }
                    >
                      <Trans>Start empty</Trans>
                    </Button>
                  </div>
                </div>
              ) : (
                <TranslationFields
                  form={form}
                  locale={code}
                  type={values.type}
                  primary={values.translations[cmsPrimaryLocale]}
                />
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {values.type === 'page' && (
        <NestedItems
          parent={node}
          items={children}
          titleOf={titleOf}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onReorder={onReorder}
        />
      )}

      {/* The page scrolls in <main>, whose bottom padding (pb-4, md:pb-8) a
          sticky element stops short of: the negative offset lets the bar
          reach the window's bottom edge instead of floating above it. */}
      <div className="sticky -bottom-4 z-10 -mx-4 flex items-center justify-end gap-2 rounded-b-xl border-t bg-card px-4 py-3 md:-bottom-8">
        <span className="me-auto text-sm text-muted-foreground" role="status">
          {isDirty ? (
            <span className="flex items-center gap-2 text-foreground">
              <span className="size-1.5 rounded-full bg-amber-500" />
              <Trans>Unsaved changes</Trans>
            </span>
          ) : (
            <Trans>All changes saved</Trans>
          )}
        </span>
        <Button
          type="button"
          variant="ghost"
          disabled={!isDirty || save.isPending}
          onClick={() => form.reset()}
        >
          <Trans>Cancel</Trans>
        </Button>
        <Button
          type="submit"
          disabled={!isDirty || save.isPending}
          aria-busy={save.isPending}
        >
          {save.isPending && <Loader2Icon className="animate-spin" />}
          <Trans>Save</Trans>
        </Button>
      </div>

      <TypeChangeDialog
        change={pendingType}
        onClose={() => setPendingType(null)}
        onConfirm={() => {
          form.setValue('type', 'link', { shouldDirty: true });
          setPendingType(null);
        }}
      />

      <AlertDialog
        open={blocker.status === 'blocked'}
        onOpenChange={(open) => !open && blocker.reset?.()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Save changes?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>“{titleOf(node)}” has unsaved changes.</Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              <Trans>Stay</Trans>
            </AlertDialogCancel>
            <Button variant="outline" onClick={() => blocker.proceed?.()}>
              <Trans>Don’t save</Trans>
            </Button>
            <Button
              disabled={save.isPending}
              onClick={async () => {
                if (await submit()) blocker.proceed?.();
                else blocker.reset?.();
              }}
            >
              <Trans>Save</Trans>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

// Marks an optional field's label, as elsewhere in the app.
function Optional() {
  return (
    <span className="-ml-1 font-normal text-muted-foreground">
      (<Trans>optional</Trans>)
    </span>
  );
}

function TranslationFields({
  form,
  locale,
  type,
  primary
}: {
  form: ReturnType<typeof useForm<CmsForm>>;
  locale: CmsLocale;
  type: CmsNodeType;
  primary: CmsForm['translations'][CmsLocale];
}) {
  const { t } = useLingui();
  const isPrimary = locale === cmsPrimaryLocale;
  // Secondary locales show the German text as a hint of what's shown instead.
  const placeholder = (value: string) =>
    isPrimary ? undefined : value || undefined;
  const id = (field: string) => `cms-${locale}-${field}`;

  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={form.control}
        name={`translations.${locale}.title`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={id('title')}>
              <Trans>Title</Trans>
              {!isPrimary && <Optional />}
            </FieldLabel>
            <Input
              {...field}
              id={id('title')}
              maxLength={200}
              placeholder={placeholder(primary.title)}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name={`translations.${locale}.subtitle`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <div className="flex items-baseline justify-between">
              <FieldLabel htmlFor={id('subtitle')}>
                <Trans>Subtitle</Trans>
                <Optional />
              </FieldLabel>
              <span
                className={cn(
                  'text-xs tabular-nums',
                  field.value.length > cmsSubtitleMaxLength
                    ? 'text-danger'
                    : 'text-muted-foreground'
                )}
                aria-live="polite"
              >
                {field.value.length}/{cmsSubtitleMaxLength}
              </span>
            </div>
            <Input
              {...field}
              id={id('subtitle')}
              placeholder={placeholder(primary.subtitle)}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {type === 'page' ? (
        <Controller
          control={form.control}
          name={`translations.${locale}.body`}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor={id('body')}>
                <Trans>Text</Trans>
              </FieldLabel>
              <RichTextEditor
                variant="cms"
                id={id('body')}
                aria-label={t`Text`}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </Field>
          )}
        />
      ) : (
        !isPrimary && (
          <Controller
            control={form.control}
            name={`translations.${locale}.url`}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor={id('url')}>
                  <Trans>URL for this language</Trans>
                  <Optional />
                </FieldLabel>
                <Input
                  {...field}
                  id={id('url')}
                  type="url"
                  inputMode="url"
                  placeholder={form.getValues('url') || 'https://'}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  <Trans>Leave empty to use the main URL.</Trans>
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )
      )}
    </div>
  );
}

function NestedItems({
  parent,
  items,
  titleOf,
  onSelect,
  onAddChild,
  onReorder
}: {
  parent: CmsNode;
  items: CmsNode[];
  titleOf: (node: CmsNode) => string;
  onSelect: (id: number) => void;
  onAddChild: (node: CmsNode, type: CmsNodeType) => void;
  onReorder: (node: CmsNode, index: number) => void;
}) {
  const { t } = useLingui();
  const { itemProps } = useDragReorder((from, to) => {
    const moved = items[from];
    if (moved) onReorder(moved, moveItem(items, from, to).indexOf(moved));
  });

  return (
    <section aria-labelledby="cms-nested" className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 id="cms-nested" className="text-sm font-medium">
          <Trans>Nested items</Trans>
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button type="button" size="sm" variant="outline" />}
          >
            <PlusIcon />
            <Trans>Add</Trans>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddChild(parent, 'page')}>
              <FileTextIcon />
              <Trans>Page</Trans>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddChild(parent, 'link')}>
              <ArrowUpRightIcon />
              <Trans>External link</Trans>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          <Trans>No nested items.</Trans>
        </p>
      ) : (
        <ul className="divide-y rounded-lg border" aria-label={t`Nested items`}>
          {items.map((item, index) => (
            <li
              key={item.id}
              {...itemProps(index)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm data-dragging:opacity-40 data-drop-target:bg-accent"
            >
              <GripVerticalIcon
                className="size-4 cursor-grab text-muted-foreground"
                aria-hidden
              />
              {item.type === 'link' ? (
                <ArrowUpRightIcon className="size-4 text-muted-foreground" />
              ) : (
                <FileTextIcon className="size-4 text-muted-foreground" />
              )}
              <button
                type="button"
                className={cn(
                  'min-w-0 flex-1 truncate text-start underline-offset-4 hover:underline',
                  item.hidden && 'text-muted-foreground'
                )}
                onClick={() => onSelect(item.id)}
              >
                {titleOf(item)}
              </button>
              {item.hidden && (
                <EyeOffIcon
                  className="size-4 text-muted-foreground"
                  aria-label={t`Hidden`}
                />
              )}
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label={t`Move up`}
                disabled={index === 0}
                onClick={() => onReorder(item, index - 1)}
              >
                <ArrowUpIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TypeChangeDialog({
  change,
  onClose,
  onConfirm
}: {
  change: TypeChange | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const blocked = change?.kind === 'blocked';
  return (
    <AlertDialog
      open={change != null && change.kind !== 'free'}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? (
              <Trans>This page has nested items</Trans>
            ) : (
              <Trans>Make this a link?</Trans>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {change?.kind === 'blocked' && (
              <Plural
                value={change.childCount}
                one="A link can’t contain other items. Move or delete its # nested item first."
                other="A link can’t contain other items. Move or delete its # nested items first."
              />
            )}
            {change?.kind === 'confirm' &&
              (change.hasText ? (
                <Plural
                  value={change.imageCount}
                  _0="The text is removed when you save."
                  one="The text and # image are removed when you save."
                  other="The text and # images are removed when you save."
                />
              ) : (
                <Plural
                  value={change.imageCount}
                  one="# image is removed when you save."
                  other="# images are removed when you save."
                />
              ))}{' '}
            {!blocked && (
              <Trans>
                Until then you can switch back without losing anything.
              </Trans>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {blocked ? (
            <AlertDialogAction onClick={onClose}>
              <Trans>OK</Trans>
            </AlertDialogAction>
          ) : (
            <>
              <AlertDialogCancel>
                <Trans>Cancel</Trans>
              </AlertDialogCancel>
              <AlertDialogAction onClick={onConfirm}>
                <Trans>Make it a link</Trans>
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
