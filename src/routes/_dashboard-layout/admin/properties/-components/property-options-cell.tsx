import { useLingui } from '@lingui/react/macro';
import type { PropertyOption } from 'shared/types/properties';

import { Badge, badgeVariants } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { propertyOptionLabels } from './property-options';

const VISIBLE = 2;

/** The first few solutions as badges, the rest behind a "+N" tooltip. */
export function PropertyOptionsCell({
  options
}: {
  options: PropertyOption[];
}) {
  const { t } = useLingui();

  if (options.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const labels = options.map((option) => t(propertyOptionLabels[option]));
  const hidden = labels.slice(VISIBLE);

  return (
    <div className="flex min-w-0 items-center gap-1">
      {labels.slice(0, VISIBLE).map((label) => (
        <Badge
          key={label}
          color="gray"
          size="sm"
          className="min-w-0 shrink"
          title={label}
        >
          <span className="truncate">{label}</span>
        </Badge>
      ))}
      {hidden.length > 0 && (
        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-label={hidden.join(', ')}
            className={cn(badgeVariants({ color: 'gray', size: 'sm' }))}
          >
            +{hidden.length}
          </TooltipTrigger>
          <TooltipContent>
            <ul>
              {hidden.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
