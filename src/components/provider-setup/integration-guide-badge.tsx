import { Trans } from '@lingui/react/macro';
import { ArrowUpRightIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

/** A link to a provider's documentation, opened in a new tab. */
export function IntegrationGuideBadge({ href }: { href: string }) {
  return (
    <Badge
      variant="outline"
      size="sm"
      // Dark: a step lighter than the card, so it sits on it rather than
      // sinking into it
      className="cursor-pointer bg-background text-foreground hover:bg-background/50 dark:border-foreground/15 dark:bg-muted dark:hover:bg-muted/70"
      render={<a href={href} target="_blank" rel="noopener noreferrer" />}
    >
      <Trans>Integration Guide</Trans>
      <ArrowUpRightIcon aria-hidden="true" />
    </Badge>
  );
}
