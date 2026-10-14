import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  type ItemInstance,
  selectionFeature,
  syncDataLoaderFeature
} from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  ArrowUpRightIcon,
  CopyIcon,
  CornerUpRightIcon,
  EllipsisIcon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  LanguagesIcon,
  PlusIcon,
  Trash2Icon
} from 'lucide-react';
import * as React from 'react';
import { cmsChildren, cmsVisibility } from 'shared/cms-tree';
import type { CmsLocale, CmsNodeType } from 'shared/types/cms';

import type { CmsNode } from '@/api/cms';
import { CountBadge } from '@/components/ui/count-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tree,
  TreeDragLine,
  TreeItem,
  TreeItemLabel
} from '@/components/ui/tree';
import { cn } from '@/lib/utils';

import { isAnyTranslationMissing, localized } from '../-lib/cms-content';
import { useNodeTitle } from '../-lib/use-node-title';

const rootItemId = 'root';
const indent = 20;

type ItemData = { children: string[] };

export interface CmsTreeActions {
  onSelect: (id: number) => void;
  onToggleHidden: (node: CmsNode) => void;
  onAddChild: (node: CmsNode, type: CmsNodeType) => void;
  onDuplicate: (node: CmsNode) => void;
  onMoveTo: (node: CmsNode) => void;
  onDelete: (node: CmsNode) => void;
  // Reorder within the node's level: `index` among its siblings.
  onReorder: (node: CmsNode, index: number) => void;
}

function NodeMenu({
  node,
  actions
}: {
  node: CmsNode;
  actions: CmsTreeActions;
}) {
  const { t } = useLingui();
  const stop = (event: React.SyntheticEvent) => event.stopPropagation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t`Actions`}
        onClick={stop}
        onKeyDown={stop}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-foreground/10 focus-visible:opacity-100 data-popup-open:opacity-100"
      >
        <EllipsisIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52" onClick={stop}>
        {node.type === 'page' && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PlusIcon />
              <Trans>Add nested</Trans>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => actions.onAddChild(node, 'page')}
              >
                <FileTextIcon />
                <Trans>Page</Trans>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onAddChild(node, 'link')}
              >
                <ArrowUpRightIcon />
                <Trans>External link</Trans>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuItem onClick={() => actions.onDuplicate(node)}>
          <CopyIcon />
          <Trans>Duplicate</Trans>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onMoveTo(node)}>
          <CornerUpRightIcon />
          <Trans>Move to…</Trans>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onToggleHidden(node)}>
          {node.hidden ? <EyeIcon /> : <EyeOffIcon />}
          {node.hidden ? <Trans>Show</Trans> : <Trans>Hide</Trans>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive-soft"
          onClick={() => actions.onDelete(node)}
        >
          <Trash2Icon />
          <Trans>Delete</Trans>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CmsTreeProps {
  // Every node of the property: for counts, visibility and drop rules.
  nodes: CmsNode[];
  // What to show: all nodes, or a filtered subset with their ancestors.
  shownNodes: CmsNode[];
  // A search or filter is on: everything is expanded and dragging is off.
  isFiltering: boolean;
  locale: CmsLocale;
  selectedId: number | null;
  expandedItems: string[];
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
  actions: CmsTreeActions;
}

export function CmsTree({
  nodes,
  shownNodes,
  isFiltering,
  locale,
  selectedId,
  expandedItems: userExpandedItems,
  setExpandedItems,
  actions
}: CmsTreeProps) {
  const { t } = useLingui();
  const titleOf = useNodeTitle();
  const byId = React.useMemo(
    () => new Map(nodes.map((node) => [String(node.id), node])),
    [nodes]
  );

  const items = React.useMemo(() => {
    const result: Record<string, ItemData> = {};
    const shown = new Set(shownNodes.map((node) => node.id));
    const add = (itemId: string, parentId: number | null) => {
      result[itemId] = {
        children: cmsChildren(nodes, parentId)
          .filter((child) => shown.has(child.id))
          .map((child) => String(child.id))
      };
    };
    add(rootItemId, null);
    for (const node of shownNodes) add(String(node.id), node.id);
    return result;
  }, [nodes, shownNodes]);

  const expandedItems = React.useMemo(
    () => (isFiltering ? Object.keys(items) : userExpandedItems),
    [isFiltering, items, userExpandedItems]
  );

  const [focusedItem, setFocusedItem] = React.useState<string | null>(null);

  // Drag and drop moves the selected items, or the focused one without
  // selection support — not the row grabbed. Selection mirrors the open node
  // and can't be changed here, so a drag always takes the grabbed row alone.
  const selectedItems = React.useMemo(
    () => (selectedId == null ? [] : [String(selectedId)]),
    [selectedId]
  );

  const tree = useTree<ItemData>({
    state: {
      expandedItems,
      focusedItem: focusedItem && items[focusedItem] ? focusedItem : null,
      selectedItems
    },
    setSelectedItems: () => {},
    setExpandedItems: (updater) => {
      if (!isFiltering) setExpandedItems(updater);
    },
    setFocusedItem,
    onPrimaryAction: (item) => actions.onSelect(Number(item.getId())),
    indent,
    rootItemId,
    getItemName: (item) => {
      const node = byId.get(item.getId());
      return node ? localized(node.translations, locale, 'title').value : '';
    },
    isItemFolder: (item) => item.getItemData().children.length > 0,
    dataLoader: {
      getItem: (itemId) => items[itemId] ?? { children: [] },
      getChildren: (itemId) => items[itemId]?.children ?? []
    },
    // Reordering within a level only; moving elsewhere is "Move to…".
    canReorder: true,
    canDrag: () => !isFiltering,
    // Asked for a position among the parent's children and, first, for the
    // parent itself ("may it go in there at all?"): both must hold for the
    // node's own parent only. onDrop acts on a position alone.
    canDrop: (dragged, target) => {
      if (dragged.length !== 1) return false;
      const node = byId.get(dragged[0]?.getId() ?? '');
      const parentItemId =
        node?.parent_id == null ? rootItemId : String(node.parent_id);
      return target.item.getId() === parentItemId;
    },
    onDrop: (dragged, target) => {
      const node = byId.get(dragged[0]?.getId() ?? '');
      if (node && 'insertionIndex' in target) {
        actions.onReorder(node, target.insertionIndex);
      }
    },
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      selectionFeature,
      dragAndDropFeature
    ]
  });

  React.useEffect(() => {
    tree.rebuildTree();
  }, [tree, items]);

  return (
    <Tree indent={indent} tree={tree} className="relative">
      {tree.getItems().map((item: ItemInstance<ItemData>) => {
        const node = byId.get(item.getId());
        if (!node) return null;
        const title = localized(node.translations, locale, 'title');
        const visibility = cmsVisibility(nodes, node.id);
        const childCount = cmsChildren(nodes, node.id).length;
        const isSelected = node.id === selectedId;

        return (
          <TreeItem key={node.id} item={item} asChild className="pb-0.5">
            <div
              onKeyDown={(event) => {
                if (
                  event.target === event.currentTarget &&
                  (event.key === 'Enter' || event.key === ' ')
                ) {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              }}
            >
              <TreeItemLabel
                className={cn(
                  'group w-full gap-1.5 rounded-lg bg-transparent px-2 py-1 in-focus-visible:ring-2 in-focus-visible:ring-primary in-focus-visible:ring-inset',
                  isSelected
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent',
                  // Hidden because of an ancestor: paler, no flag of its own.
                  visibility.state === 'hidden_by_parent' && 'opacity-50'
                )}
              >
                {node.type === 'link' ? (
                  <ArrowUpRightIcon
                    className="size-4 text-muted-foreground"
                    aria-label={t`External link`}
                  />
                ) : (
                  <FileTextIcon
                    className="size-4 text-muted-foreground"
                    aria-label={t`Page`}
                  />
                )}
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate',
                    title.fallback && 'text-muted-foreground italic',
                    visibility.state === 'hidden' && 'text-muted-foreground'
                  )}
                  title={title.value}
                >
                  {titleOf(node, locale)}
                </span>
                {isAnyTranslationMissing(node.translations) && (
                  <LanguagesIcon
                    className="size-3.5 text-amber-600 dark:text-amber-400"
                    aria-label={t`Translation missing`}
                  >
                    <title>{t`Translation missing`}</title>
                  </LanguagesIcon>
                )}
                {node.type === 'page' && childCount > 0 && (
                  <CountBadge count={childCount} />
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    actions.onToggleHidden(node);
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                  aria-label={node.hidden ? t`Show` : t`Hide`}
                  aria-pressed={node.hidden}
                  title={
                    visibility.state === 'hidden_by_parent'
                      ? t`Hidden because a parent is hidden`
                      : node.hidden
                        ? t`Hidden — click to show`
                        : t`Visible — click to hide`
                  }
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                    node.hidden
                      ? 'text-foreground'
                      : 'text-muted-foreground opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100'
                  )}
                >
                  {node.hidden ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
                <NodeMenu node={node} actions={actions} />
              </TreeItemLabel>
            </div>
          </TreeItem>
        );
      })}
      <TreeDragLine className="bg-muted-foreground before:border-muted-foreground" />
    </Tree>
  );
}
