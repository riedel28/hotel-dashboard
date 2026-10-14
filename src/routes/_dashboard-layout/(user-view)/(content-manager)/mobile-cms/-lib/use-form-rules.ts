import { useLingui } from '@lingui/react/macro';
import * as React from 'react';
import { type CmsNodeType, cmsUrlSchema } from 'shared/types/cms';
import { z } from 'zod';

/** The rules the create dialog and the editor share, with their messages. */
export function useFormRules() {
  const { t } = useLingui();
  return React.useMemo(() => {
    const urlMessage = t`Enter a URL starting with http:// or https://`;
    return {
      title: z
        .string()
        .trim()
        .min(1, t`Title is required`),
      urlMessage,
      // For superRefine: a link needs an http(s) URL, a page none.
      linkUrl: (
        values: { type: CmsNodeType; url: string },
        ctx: z.RefinementCtx
      ) => {
        if (
          values.type === 'link' &&
          !cmsUrlSchema.safeParse(values.url).success
        ) {
          ctx.addIssue({ code: 'custom', path: ['url'], message: urlMessage });
        }
      }
    };
  }, [t]);
}
