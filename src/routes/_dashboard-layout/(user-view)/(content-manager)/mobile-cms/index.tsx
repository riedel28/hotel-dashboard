import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  AlertCircleIcon,
  EyeIcon,
  ListTreeIcon,
  PlusIcon,
  RotateCcwIcon,
  SmartphoneIcon
} from 'lucide-react';
import * as React from 'react';
import { cmsDescendantIds } from 'shared/cms-tree';
import {
  type CmsLocale,
  cmsLocales,
  type CmsNodeType,
  cmsPrimaryLocale
} from 'shared/types/cms';
import { z } from 'zod';

import { type CmsNode, cmsNodesQueryOptions } from '@/api/cms';
import { selectablePropertiesQueryOptions } from '@/api/properties';
import { useAuth } from '@/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentTitle } from '@/hooks/use-document-title';

import { CmsTree, type CmsTreeActions } from './-components/cms-tree';
import {
  CreateNodeDialog,
  type CreateNodeRequest
} from './-components/create-node-dialog';
import { DeleteNodeDialog } from './-components/delete-node-dialog';
import { MoveNodeDialog } from './-components/move-node-dialog';
import { NodeEditor } from './-components/node-editor';
import { PhonePreview } from './-components/preview/phone-preview';
import { useCmsMutations } from './-components/use-cms-mutations';
import {
  applyForm,
  type CmsForm,
  filterNodes,
  lineage,
  localized
} from './-lib/cms-content';

const mobileCmsSearchSchema = z.object({
  // The selected node; a link to it opens it directly.
  node: z.number().int().positive().optional()
});

function MobileCmsPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Mobile CMS`);
  const navigate = useNavigate({ from: Route.fullPath });
  const requestedId = Route.useSearch().node ?? null;

  const nodesQuery = useQuery(cmsNodesQueryOptions);
  const nodes = React.useMemo(() => nodesQuery.data ?? [], [nodesQuery.data]);
  // An id that isn't among the property's nodes (stale link, deleted node,
  // property switch) counts as no selection.
  const selected = nodes.find((node) => node.id === requestedId) ?? null;

  const { user } = useAuth();
  const { data: properties } = useQuery(selectablePropertiesQueryOptions());
  const propertyName =
    properties?.index.find((p) => p.id === user?.selected_property_id)?.name ??
    t`Hotel`;

  const mutations = useCmsMutations();

  // --- Tree state ---
  const [treeLocale, setTreeLocale] =
    React.useState<CmsLocale>(cmsPrimaryLocale);
  const [query, setQuery] = React.useState('');
  const [onlyMissing, setOnlyMissing] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const isFiltering = query.trim() !== '' || onlyMissing;
  const shownNodes = React.useMemo(
    () =>
      isFiltering
        ? filterNodes(nodes, { query, locale: treeLocale, onlyMissing })
        : nodes,
    [nodes, isFiltering, query, treeLocale, onlyMissing]
  );

  // Keep the selected node's path expanded, e.g. when opened from a link.
  const selectedId = selected?.id ?? null;
  React.useEffect(() => {
    if (selectedId == null) return;
    const ancestors = lineage(nodes, selectedId)
      .slice(1)
      .map((node) => String(node.id));
    setExpandedItems((current) =>
      ancestors.every((id) => current.includes(id))
        ? current
        : [...new Set([...current, ...ancestors])]
    );
  }, [selectedId, nodes]);

  // --- Panels on narrow screens ---
  const [treeOpen, setTreeOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const select = React.useCallback(
    (id: number | null) => {
      setTreeOpen(false);
      void navigate({ search: id == null ? {} : { node: id } });
    },
    [navigate]
  );

  // --- The editor's unsaved state, for the preview ---
  const [draft, setDraft] = React.useState<CmsForm | null>(null);
  const previewNodes = React.useMemo(
    () =>
      draft && selected
        ? nodes.map((node) =>
            node.id === selected.id ? applyForm(node, draft) : node
          )
        : nodes,
    [nodes, draft, selected]
  );

  // --- Dialogs ---
  const [createRequest, setCreateRequest] =
    React.useState<CreateNodeRequest | null>(null);
  const [moveTarget, setMoveTarget] = React.useState<CmsNode | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<CmsNode | null>(null);

  const titleOf = React.useCallback(
    (node: CmsNode) =>
      localized(node.translations, cmsPrimaryLocale, 'title').value ||
      t`Untitled`,
    [t]
  );

  const actions: CmsTreeActions = React.useMemo(
    () => ({
      onSelect: (id) => select(id),
      onToggleHidden: (node) =>
        mutations.setVisibility.mutate({ id: node.id, hidden: !node.hidden }),
      onAddChild: (node, type) =>
        setCreateRequest({
          parentId: node.id,
          parentTitle: titleOf(node),
          type
        }),
      onDuplicate: (node) =>
        mutations.duplicate.mutate(node.id, {
          onSuccess: (copy) => select(copy.id)
        }),
      onMoveTo: (node) => setMoveTarget(node),
      onDelete: (node) => setDeleteTarget(node),
      onReorder: (node, index) =>
        mutations.move.mutate({ id: node.id, parent_id: node.parent_id, index })
    }),
    [
      mutations.setVisibility,
      mutations.duplicate,
      mutations.move,
      select,
      titleOf
    ]
  );

  const addSection = () =>
    setCreateRequest({ parentId: null, parentTitle: null });

  const createNode = async (data: {
    type: CmsNodeType;
    title: string;
    url?: string;
  }) => {
    const parentId = createRequest?.parentId ?? null;
    const created = await mutations.create.mutateAsync({
      parent_id: parentId,
      ...data
    });
    if (parentId != null) {
      setExpandedItems((current) => [
        ...new Set([...current, String(parentId)])
      ]);
    }
    select(created.id);
  };

  const confirmDelete = () => {
    const target = deleteTarget;
    if (!target) return;
    setDeleteTarget(null);
    mutations.remove.mutate(
      { id: target.id, title: titleOf(target) },
      {
        onSuccess: () => {
          // The open node went with it: show its nearest surviving ancestor.
          if (
            selectedId != null &&
            (selectedId === target.id ||
              cmsDescendantIds(nodes, target.id).includes(selectedId))
          ) {
            void navigate({
              search:
                target.parent_id == null ? {} : { node: target.parent_id },
              ignoreBlocker: true
            });
          }
        }
      }
    );
  };

  const treePanel = (
    <TreePanel
      nodes={nodes}
      shownNodes={shownNodes}
      isFiltering={isFiltering}
      locale={treeLocale}
      onLocaleChange={setTreeLocale}
      query={query}
      onQueryChange={setQuery}
      onlyMissing={onlyMissing}
      onOnlyMissingChange={setOnlyMissing}
      selectedId={selectedId}
      expandedItems={expandedItems}
      setExpandedItems={setExpandedItems}
      actions={actions}
      onAddSection={addSection}
    />
  );

  const preview = (
    <PhonePreview
      nodes={previewNodes}
      selectedId={selectedId}
      onSelect={select}
      homeTitle={propertyName}
    />
  );

  let content: React.ReactNode;
  if (nodesQuery.isPending) {
    content = (
      <div className="grid gap-4 @3xl:grid-cols-[minmax(17rem,22rem)_minmax(0,38rem)]">
        <div className="space-y-2 @max-3xl:hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  } else if (nodesQuery.isError) {
    content = (
      <Alert variant="destructive" className="max-w-xl">
        <AlertCircleIcon />
        <AlertTitle>
          <Trans>The content could not be loaded</Trans>
        </AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-2">
          {nodesQuery.error.message}
          <Button
            size="sm"
            variant="outline"
            onClick={() => void nodesQuery.refetch()}
          >
            <RotateCcwIcon />
            <Trans>Try again</Trans>
          </Button>
        </AlertDescription>
      </Alert>
    );
  } else if (nodes.length === 0) {
    content = (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SmartphoneIcon />
          </EmptyMedia>
          <EmptyTitle>
            <Trans>No content yet</Trans>
          </EmptyTitle>
          <EmptyDescription>
            <Trans>
              Sections are the top level of the hotel’s mobile app. Start with
              the first one.
            </Trans>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={addSection}>
            <PlusIcon />
            <Trans>Create the first section</Trans>
          </Button>
        </EmptyContent>
      </Empty>
    );
  } else {
    content = (
      // Columns follow the room <main> has (sidebar open or not), not the
      // window; the preview gets its own column only from 80rem. Tree and
      // form stop at a readable width either way, the rest stays empty.
      <div className="grid items-start gap-6 @3xl:grid-cols-[minmax(17rem,22rem)_minmax(0,38rem)] @7xl:grid-cols-[minmax(17rem,22rem)_minmax(0,38rem)_21rem]">
        <aside className="sticky top-4 @max-3xl:hidden">{treePanel}</aside>

        <section
          className="min-w-0 rounded-xl border bg-card px-4 pt-4"
          aria-label={t`Editor`}
        >
          {selected ? (
            <NodeEditor
              key={selected.id}
              node={selected}
              nodes={nodes}
              onDraftChange={setDraft}
              onSelect={select}
              onToggleHidden={actions.onToggleHidden}
              onAddChild={actions.onAddChild}
              onReorder={actions.onReorder}
            />
          ) : (
            // Styled like Products' empty state: a title and a hint.
            <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 pb-4 text-center">
              <p className="text-sm font-medium">
                {requestedId != null ? (
                  <Trans>This item doesn’t exist (anymore)</Trans>
                ) : (
                  <Trans>No item selected</Trans>
                )}
              </p>
              <p className="text-sm text-balance text-muted-foreground">
                <Trans>
                  Choose a page or link in the tree, or tap one in the preview.
                </Trans>
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 @3xl:hidden"
                onClick={() => setTreeOpen(true)}
              >
                <ListTreeIcon />
                <Trans>Show content tree</Trans>
              </Button>
            </div>
          )}
        </section>

        <aside className="sticky top-4 @max-7xl:hidden" aria-label={t`Preview`}>
          {preview}
        </aside>
      </div>
    );
  }

  return (
    <div className="@container space-y-1">
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
              <Trans>Mobile CMS</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">
            <Trans>Mobile CMS</Trans>
          </h1>
          <p className="text-sm text-muted-foreground">
            <Trans>
              Content of the mobile app for {propertyName}. Saved changes are
              live at once.
            </Trans>
          </p>
        </div>
        {nodes.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="@3xl:hidden"
              onClick={() => setTreeOpen(true)}
            >
              <ListTreeIcon />
              <Trans>Tree</Trans>
            </Button>
            <Button
              variant="outline"
              className="@7xl:hidden"
              onClick={() => setPreviewOpen(true)}
            >
              <EyeIcon />
              <Trans>Preview</Trans>
            </Button>
          </div>
        )}
      </div>

      {content}

      <Sheet open={treeOpen} onOpenChange={setTreeOpen}>
        <SheetContent side="left" className="w-80 overflow-y-auto p-4">
          <SheetHeader className="p-0">
            <SheetTitle>
              <Trans>Content</Trans>
            </SheetTitle>
          </SheetHeader>
          {treePanel}
        </SheetContent>
      </Sheet>

      <Drawer open={previewOpen} onOpenChange={setPreviewOpen}>
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>
              <Trans>Preview</Trans>
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody>{preview}</DrawerBody>
        </DrawerContent>
      </Drawer>

      <CreateNodeDialog
        request={createRequest}
        onOpenChange={(open) => !open && setCreateRequest(null)}
        onCreate={createNode}
      />
      <MoveNodeDialog
        node={moveTarget}
        nodes={nodes}
        locale={treeLocale}
        onOpenChange={(open) => !open && setMoveTarget(null)}
        onMove={(parentId, index) => {
          if (!moveTarget) return;
          mutations.move.mutate({
            id: moveTarget.id,
            parent_id: parentId,
            index
          });
          if (parentId != null) {
            setExpandedItems((current) => [
              ...new Set([...current, String(parentId)])
            ]);
          }
        }}
      />
      <DeleteNodeDialog
        target={
          deleteTarget && {
            title: titleOf(deleteTarget),
            descendantTitles: cmsDescendantIds(nodes, deleteTarget.id).map(
              (id) => titleOf(nodes.find((node) => node.id === id)!)
            )
          }
        }
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function TreePanel({
  nodes,
  shownNodes,
  isFiltering,
  locale,
  onLocaleChange,
  query,
  onQueryChange,
  onlyMissing,
  onOnlyMissingChange,
  selectedId,
  expandedItems,
  setExpandedItems,
  actions,
  onAddSection
}: {
  nodes: CmsNode[];
  shownNodes: CmsNode[];
  isFiltering: boolean;
  locale: CmsLocale;
  onLocaleChange: (locale: CmsLocale) => void;
  query: string;
  onQueryChange: (query: string) => void;
  onlyMissing: boolean;
  onOnlyMissingChange: (value: boolean) => void;
  selectedId: number | null;
  expandedItems: string[];
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
  actions: CmsTreeActions;
  onAddSection: () => void;
}) {
  const { t } = useLingui();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          onClear={() => onQueryChange('')}
          placeholder={t`Search titles`}
          wrapperClassName="flex-1"
        />
        <SegmentedControl
          label={t`Language of the titles`}
          value={locale}
          onValueChange={onLocaleChange}
          options={cmsLocales.map((value) => ({
            value,
            label: value.toUpperCase()
          }))}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="cms-only-missing"
            aria-label={t`Only untranslated`}
            checked={onlyMissing}
            onCheckedChange={(checked) => onOnlyMissingChange(checked === true)}
          />
          <Label htmlFor="cms-only-missing" className="font-normal">
            <Trans>Only untranslated</Trans>
          </Label>
        </div>
        <Button size="sm" variant="outline" onClick={onAddSection}>
          <PlusIcon />
          <Trans>Section</Trans>
        </Button>
      </div>
      {shownNodes.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          <Trans>Nothing matches</Trans>
        </p>
      ) : (
        <CmsTree
          nodes={nodes}
          shownNodes={shownNodes}
          isFiltering={isFiltering}
          locale={locale}
          selectedId={selectedId}
          expandedItems={expandedItems}
          setExpandedItems={setExpandedItems}
          actions={actions}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(content-manager)/mobile-cms/'
)({
  component: MobileCmsPage,
  validateSearch: mobileCmsSearchSchema
});
