import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBlocker } from '@tanstack/react-router';
import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  type CmsLocale,
  cmsPrimaryLocale,
  cmsSubtitleMaxLength,
  cmsUrlSchema
} from 'shared/types/cms';
import { toast } from 'sonner';
import { z } from 'zod';

import { ApiError } from '@/api/client';
import { type CmsNode, cmsNodesQueryOptions, saveCmsNode } from '@/api/cms';

import { type CmsForm, formToPayload, nodeToForm } from '../-lib/cms-content';
import { useNodeTitle } from '../-lib/use-node-title';

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

/**
 * The editor form of `node` and its saving: the version it was loaded from
 * (a stale save is answered with 409), the toasts, and the guard against
 * leaving it with unsaved changes. `submit` resolves whether it saved.
 */
export function useNodeForm(node: CmsNode) {
  const { t } = useLingui();
  const schema = useFormSchema();
  const titleOf = useNodeTitle();
  const queryClient = useQueryClient();
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

  return { form, values, isDirty, save, submit, blocker };
}
