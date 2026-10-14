import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { EyeIcon, ListTreeIcon, PlusIcon, SmartphoneIcon } from 'lucide-react';
import * as React from 'react';
import { cmsDescendantIds, cmsLineage } from 'shared/cms-tree';
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
import { ErrorState } from '@/components/error-state';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useDocumentTitle } from '@/hooks/use-document-title';

import { CmsTree, type CmsTreeActions } from './-components/cms-tree';
import {
  CreateNodeDialog,
  type CreateNodeRequest
} from './-components/create-node-dialog';
import { DeleteNodeDialog } from './-components/delete-node-dialog';
import { CmsLoadingState } from './-components/loading-state';
import { MoveNodeDialog } from './-components/move-node-dialog';
import { NodeEditor } from './-components/node-editor';
import { PhonePreview } from './-components/preview/phone-preview';
import { useCmsMutations } from './-components/use-cms-mutations';
import { applyForm, type CmsDraft, filterNodes } from './-lib/cms-content';
import { useNodeTitle } from './-lib/use-node-title';

// Columns follow the room <main> has (sidebar open or not), not the window;
// the preview gets its own column only from 80rem. Tree and form share the
// rest 5:7, so no gap is left on the right. The loading state uses it too.
const columnsClassName =
  'grid items-start gap-6 @3xl:grid-cols-[minmax(17rem,5fr)_minmax(0,7fr)] @7xl:grid-cols-[minmax(17rem,5fr)_minmax(0,7fr)_21rem]';

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
    const ancestors = cmsLineage(nodes, selectedId)
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
  // Tagged with its node: right after switching nodes, the page renders once
  // before the new editor has reported, still holding the old one's form.
  const [draft, setDraft] = React.useState<CmsDraft | null>(null);
  const previewNodes = React.useMemo(
    () =>
      draft && draft.nodeId === selected?.id
        ? nodes.map((node) =>
            node.id === draft.nodeId ? applyForm(node, draft.form) : node
          )
        : nodes,
    [nodes, draft, selected]
  );

  // --- Dialogs ---
  const [createRequest, setCreateRequest] =
    React.useState<CreateNodeRequest | null>(null);
  const [moveTarget, setMoveTarget] = React.useState<CmsNode | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<CmsNode | null>(null);

  const titleOf = useNodeTitle();

  // mutate() is stable, the mutation objects around it are not.
  const { mutate: setVisibility } = mutations.setVisibility;
  const { mutate: duplicate } = mutations.duplicate;
  const { mutate: move } = mutations.move;
  const actions: CmsTreeActions = React.useMemo(
    () => ({
      onSelect: (id) => select(id),
      onToggleHidden: (node) =>
        setVisibility({ id: node.id, hidden: !node.hidden }),
      onAddChild: (node, type) =>
        setCreateRequest({
          parentId: node.id,
          parentTitle: titleOf(node),
          type
        }),
      onDuplicate: (node) =>
        duplicate(node.id, {
          onSuccess: (copy) => select(copy.id)
        }),
      onMoveTo: (node) => setMoveTarget(node),
      onDelete: (node) => setDeleteTarget(node),
      onReorder: (node, index) =>
        move({ id: node.id, parent_id: node.parent_id, index })
    }),
    [setVisibility, duplicate, move, select, titleOf]
  );

  const addSection = React.useCallback(
    () => setCreateRequest({ parentId: null, parentTitle: null }),
    []
  );

  const createNode = async (data: {
    type: CmsNodeType;
    title: string;
    url?: string;
  }) => {
    const created = await mutations.create.mutateAsync({
      parent_id: createRequest?.parentId ?? null,
      ...data
    });
    // Selecting it expands the path to it (see above).
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
    content = <CmsLoadingState columnsClassName={columnsClassName} />;
  } else if (nodesQuery.isError) {
    content = (
      <ErrorState
        title={<Trans>The content could not be loaded</Trans>}
        message={nodesQuery.error.message}
        onRetry={() => void nodesQuery.refetch()}
        isRetrying={nodesQuery.isFetching}
      />
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
              Items are the pages and links guests see in the hotel’s mobile
              app. Start with the first one.
            </Trans>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={addSection}>
            <PlusIcon />
            <Trans>Create the first item</Trans>
          </Button>
        </EmptyContent>
      </Empty>
    );
  } else {
    content = (
      <div className={columnsClassName}>
        <aside className="sticky top-4 @max-3xl:hidden">
          {/* A card like Products' categories, without its title. */}
          <Card>
            <CardContent>{treePanel}</CardContent>
          </Card>
        </aside>

        {/* overflow-visible: the form's save bar sticks to the window, which
            a clipping card would prevent. No bottom padding: the bar is the
            card's bottom edge. */}
        <Card
          role="region"
          aria-label={t`Editor`}
          className="min-w-0 overflow-visible pb-0 md:pb-0"
        >
          {selected ? (
            // Renders its own header (path and title) and content.
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
            <CardContent>
              {/* A title and a hint, a size up from Products' empty list. */}
              <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 pb-4 text-center md:pb-6">
                <p className="text-base font-medium">
                  {requestedId != null ? (
                    <Trans>This item doesn’t exist (anymore)</Trans>
                  ) : (
                    <Trans>No item selected</Trans>
                  )}
                </p>
                <p className="text-base text-balance text-muted-foreground">
                  <Trans>
                    Choose a page or link in the tree, or tap one in the
                    preview.
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
            </CardContent>
          )}
        </Card>

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
              Content of the hotel’s mobile app. Saved changes are live at once.
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

// Memoized: typing in the editor re-renders the page (the preview follows the
// draft), but the tree shows saved nodes and needn't redraw for that.
const TreePanel = React.memo(function TreePanel({
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
  // Rendered twice (column and sheet): ids must differ for the label.
  const onlyMissingId = React.useId();
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
        <Button variant="outline" onClick={onAddSection}>
          <PlusIcon />
          <Trans>Item</Trans>
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id={onlyMissingId}
            aria-label={t`Only untranslated`}
            checked={onlyMissing}
            onCheckedChange={(checked) => onOnlyMissingChange(checked === true)}
          />
          <Label htmlFor={onlyMissingId} className="font-normal">
            <Trans>Only untranslated</Trans>
          </Label>
        </div>
        <SegmentedControl
          label={t`Language of the titles`}
          size="sm"
          value={locale}
          onValueChange={onLocaleChange}
          options={cmsLocales.map((value) => ({
            value,
            label: value.toUpperCase()
          }))}
        />
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
});

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(content-manager)/mobile-cms/'
)({
  component: MobileCmsPage,
  validateSearch: mobileCmsSearchSchema
});
