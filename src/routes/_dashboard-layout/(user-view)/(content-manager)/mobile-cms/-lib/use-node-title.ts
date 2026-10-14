import { useLingui } from '@lingui/react/macro';
import * as React from 'react';
import {
  type CmsLocale,
  type CmsNode,
  cmsPrimaryLocale
} from 'shared/types/cms';

import { localized } from './cms-content';

/** A node's title as the admin shows it: in `locale`, with fallback. */
export function useNodeTitle() {
  const { t } = useLingui();
  return React.useCallback(
    (node: CmsNode, locale: CmsLocale = cmsPrimaryLocale) =>
      localized(node.translations, locale, 'title').value || t`Untitled`,
    [t]
  );
}
