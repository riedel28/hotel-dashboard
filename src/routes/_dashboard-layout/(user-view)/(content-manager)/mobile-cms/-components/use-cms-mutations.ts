import { useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MoveCmsNodeData } from 'shared/types/cms';
import { toast } from 'sonner';

import {
  type CmsNode,
  cmsNodesQueryOptions,
  createCmsNode,
  deleteCmsNode,
  duplicateCmsNode,
  moveCmsNode,
  setCmsNodeVisibility
} from '@/api/cms';

// The structural changes, applied at once (no Save button): create, move,
// hide/show, duplicate and delete, each with its toasts. The form's own save
// lives in the editor.
//
// Cache: visibility and reorders are optimistic (the eye or the row reacts
// at once and rolls back on failure); the rest wait for the server. All
// refetch the list afterwards.
export function useCmsMutations() {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { queryKey } = cmsNodesQueryOptions;
  const refetch = () => queryClient.invalidateQueries({ queryKey });

  const patchOptimistically = async (
    update: (nodes: CmsNode[]) => CmsNode[]
  ) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData<CmsNode[]>(queryKey);
    queryClient.setQueryData<CmsNode[]>(queryKey, (nodes) =>
      nodes ? update(nodes) : nodes
    );
    return { previous };
  };
  const rollback = (context: { previous?: CmsNode[] } | undefined) => {
    if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
  };

  const create = useMutation({
    mutationFn: createCmsNode,
    onSuccess: refetch,
    onError: (error) =>
      toast.error(t`Failed to create the item`, {
        description: error.message
      })
  });

  const move = useMutation({
    mutationFn: ({ id, ...data }: MoveCmsNodeData & { id: number }) =>
      moveCmsNode(id, data),
    // A reorder within a level shows at once; a move to another parent
    // waits for the server.
    onMutate: ({ id, parent_id, index }) =>
      patchOptimistically((nodes) => {
        const node = nodes.find((n) => n.id === id);
        if (!node || node.parent_id !== parent_id) return nodes;
        const siblings = nodes
          .filter((n) => n.parent_id === parent_id && n.id !== id)
          .sort((a, b) => a.position - b.position || a.id - b.id);
        siblings.splice(index, 0, node);
        const positions = new Map(siblings.map((n, i) => [n.id, i]));
        return nodes.map((n) =>
          positions.has(n.id) ? { ...n, position: positions.get(n.id)! } : n
        );
      }),
    onError: (error, _variables, context) => {
      rollback(context);
      toast.error(t`Failed to move the item`, { description: error.message });
    },
    onSettled: refetch
  });

  const setVisibility = useMutation({
    mutationFn: ({ id, hidden }: { id: number; hidden: boolean }) =>
      setCmsNodeVisibility(id, hidden),
    onMutate: ({ id, hidden }) =>
      patchOptimistically((nodes) =>
        nodes.map((n) => (n.id === id ? { ...n, hidden } : n))
      ),
    onError: (error, _variables, context) => {
      rollback(context);
      toast.error(t`Failed to change the visibility`, {
        description: error.message
      });
    },
    onSettled: refetch
  });

  const duplicate = useMutation({
    mutationFn: duplicateCmsNode,
    onSuccess: () => {
      refetch();
      toast.success(t`Duplicated. The copy is hidden until you show it.`);
    },
    onError: (error) =>
      toast.error(t`Failed to duplicate the item`, {
        description: error.message
      })
  });

  const remove = useMutation({
    mutationFn: (node: { id: number; title: string }) => deleteCmsNode(node.id),
    onSuccess: (_, node) => {
      refetch();
      toast.success(t`“${node.title}” deleted`);
    },
    onError: (error) =>
      toast.error(t`Failed to delete the item`, { description: error.message })
  });

  return { create, move, setVisibility, duplicate, remove };
}
