import { useLingui } from '@lingui/react/macro';
import type { PropertyOption } from 'shared/types/properties';

import { Badge, badgeVariants } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { propertyOptionGroups } from './property-options';

const VISIBLE = 2;

/**
 * The solutions as badges, grouped as the property form lists them: a whole
 * group goes by its name ("Messaging"), part of one names what it has
 * ("Messaging: Email, SMS"). The first few show, the rest behind "+N".
 */
export function PropertyOptionsCell({
  options
}: {
  options: PropertyOption[];
}) {
  const { t } = useLingui();

  if (options.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const labels = propertyOptionGroups.flatMap((group) => {
    const had = group.options.filter((option) => options.includes(option.id));
    const names = had.map((option) => t(option.label));
    if (!group.label) return names;
    if (had.length === 0) return [];
    return had.length === group.options.length
      ? [t(group.label)]
      : [`${t(group.label)}: ${names.join(', ')}`];
  });
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
            // Shows the rest without opening the row
            onClick={(event) => event.stopPropagation()}
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
