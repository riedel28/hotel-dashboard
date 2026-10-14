import { Trans, useLingui } from '@lingui/react/macro';
import { CornerDownRightIcon, HomeIcon } from 'lucide-react';
import * as React from 'react';
import { cmsChildren, cmsMoveError } from 'shared/cms-tree';
import type { CmsLocale } from 'shared/types/cms';

import type { CmsNode } from '@/api/cms';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import { useNodeTitle } from '../-lib/use-node-title';

interface MoveNodeDialogProps {
  node: CmsNode | null;
  nodes: CmsNode[];
  locale: CmsLocale;
  onOpenChange: (open: boolean) => void;
  onMove: (parentId: number | null, index: number) => void;
}

// Pick a new parent: the top level or any page that is neither the node, one
// of its descendants, nor its current parent. The node goes to the end there.
export function MoveNodeDialog({
  node,
  nodes,
  locale,
  onOpenChange,
  onMove
}: MoveNodeDialogProps) {
  const { t } = useLingui();
  const titleOf = useNodeTitle();
  const [target, setTarget] = React.useState<number | null | undefined>();

  React.useEffect(() => {
    setTarget(undefined);
  }, [node]);

  // Every node in tree order with its depth.
  const rows = React.useMemo(() => {
    const result: { node: CmsNode; depth: number }[] = [];
    const walk = (parentId: number | null, depth: number) => {
      for (const child of cmsChildren(nodes, parentId)) {
        result.push({ node: child, depth });
        walk(child.id, depth + 1);
      }
    };
    walk(null, 0);
    return result;
  }, [nodes]);

  if (!node) {
    return <Dialog open={false} onOpenChange={onOpenChange} />;
  }

  const options = [
    {
      id: null,
      title: t`Top level`,
      depth: 0,
      disabled: node.parent_id == null
    },
    ...rows.map(({ node: candidate, depth }) => ({
      id: candidate.id,
      title: titleOf(candidate, locale),
      depth: depth + 1,
      disabled:
        candidate.id === node.parent_id ||
        cmsMoveError(nodes, node.id, candidate.id) != null
    }))
  ];
  const title = titleOf(node, locale);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Trans>Move “{title}” to…</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Links, the item itself and its nested items can’t be chosen.
            </Trans>
          </DialogDescription>
        </DialogHeader>
        <div
          role="radiogroup"
          aria-label={t`New parent`}
          className="max-h-80 overflow-y-auto rounded-lg border p-1"
        >
          {options.map((option) => {
            const checked = option.id === target;
            return (
              <button
                key={option.id ?? 'root'}
                type="button"
                role="radio"
                aria-checked={checked}
                disabled={option.disabled}
                onClick={() => setTarget(option.id)}
                style={{ paddingInlineStart: `${option.depth * 16 + 8}px` }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md py-1.5 pe-2 text-start text-sm',
                  'hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                  'disabled:pointer-events-none disabled:opacity-40',
                  checked && 'bg-accent font-medium text-accent-foreground'
                )}
              >
                {option.id == null ? (
                  <HomeIcon className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <CornerDownRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">{option.title}</span>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <Trans>Cancel</Trans>
          </Button>
          <Button
            disabled={target === undefined}
            onClick={() => {
              if (target === undefined) return;
              onMove(target, cmsChildren(nodes, target).length);
              onOpenChange(false);
            }}
          >
            <Trans>Move</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
