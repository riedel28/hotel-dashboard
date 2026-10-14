import { Trans, useLingui } from '@lingui/react/macro';
import { ArrowUpIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { cmsChildren, cmsLineage, cmsVisibility } from 'shared/cms-tree';
import type { CmsNodeType } from 'shared/types/cms';

import type { CmsNode } from '@/api/cms';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldOptional
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioCards } from '@/components/ui/radio-cards';
import { Switch } from '@/components/ui/switch';

import { type CmsForm, typeChange, type TypeChange } from '../-lib/cms-content';
import { useNodeTitle } from '../-lib/use-node-title';
import { ImageField } from './image-field';
import { NestedItems } from './nested-items';
import { TypeChangeDialog, UnsavedChangesDialog } from './node-editor-dialogs';
import { TranslationTabs } from './translation-tabs';
import { useNodeForm } from './use-node-form';

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
  const titleOf = useNodeTitle();
  const { form, values, isDirty, save, submit, blocker } = useNodeForm(node);

  React.useEffect(() => {
    onDraftChange(values);
  }, [values, onDraftChange]);
  React.useEffect(() => () => onDraftChange(null), [onDraftChange]);

  const children = cmsChildren(nodes, node.id);
  const [pendingType, setPendingType] = React.useState<TypeChange | null>(null);
  const changeType = (to: CmsNodeType) => {
    const change = typeChange(form.getValues(), to, children.length);
    if (change.kind === 'free') {
      form.setValue('type', to, { shouldDirty: true });
    } else {
      setPendingType(change);
    }
  };

  const visibility = cmsVisibility(nodes, node.id);
  const hiddenBy =
    visibility.state === 'hidden_by_parent'
      ? nodes.find((n) => n.id === visibility.ancestorId)
      : undefined;

  const path = cmsLineage(nodes, node.id).reverse();

  return (
    <>
      {/* Like the Products card: the path above, the open item as title. */}
      <CardHeader>
        {/* Only below the top level: there the path would be Home alone. */}
        {path.length > 1 && (
          <Breadcrumb aria-label={t`Path`}>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink to="/mobile-cms" search={{}}>
                  <Trans>Home</Trans>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {path.slice(0, -1).map((ancestor) => (
                <React.Fragment key={ancestor.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="min-w-0" title={titleOf(ancestor)}>
                    <BreadcrumbLink
                      to="/mobile-cms"
                      search={{ node: ancestor.id }}
                      className="truncate"
                    >
                      {titleOf(ancestor)}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <CardTitle className="truncate text-base" title={titleOf(node)}>
          {titleOf(node)}
        </CardTitle>
        {/* Applied at once, not with Save: next to the title, not in the form. */}
        <CardAction className="flex items-center gap-2 self-end">
          <Switch
            id="cms-node-visible"
            aria-label={t`Visible to guests`}
            checked={!node.hidden}
            onCheckedChange={() => onToggleHidden(node)}
          />
          <Label htmlFor="cms-node-visible" className="font-normal">
            <Trans>Visible to guests</Trans>
          </Label>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-5"
          aria-label={t`Edit item`}
        >
          <Field className="gap-2">
            <FieldLabel id="cms-type">
              <Trans>Type</Trans>
            </FieldLabel>
            <RadioCards
              aria-labelledby="cms-type"
              value={values.type}
              onValueChange={changeType}
              options={[
                { value: 'page', label: t`Page` },
                { value: 'link', label: t`External link` }
              ]}
            />
          </Field>

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
                    <RadioCards
                      aria-labelledby="cms-open-mode"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        { value: 'in_app', label: t`In-app browser` },
                        { value: 'system', label: t`System browser` }
                      ]}
                    />
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
                      <FieldOptional />
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

          <TranslationTabs form={form} values={values} />

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
          reach the window's bottom edge instead of floating above it. The
          side margins undo the card's padding (px-4, md:px-6). */}
          <div className="sticky -bottom-4 z-10 -mx-4 flex items-center justify-end gap-2 rounded-b-xl border-t border-border/60 bg-card px-4 py-4 md:-bottom-8 md:-mx-6 md:px-6">
            <span className="me-auto text-sm" role="status">
              {isDirty && (
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  <Trans>Unsaved changes</Trans>
                </span>
              )}
            </span>
            <Button
              type="button"
              variant="outline"
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

          <UnsavedChangesDialog
            blocker={blocker}
            title={titleOf(node)}
            isSaving={save.isPending}
            onSave={submit}
          />
        </form>
      </CardContent>
    </>
  );
}
