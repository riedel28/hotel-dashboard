import { Badge } from '@/components/ui/badge';

/** A small count next to a label, e.g. how many rows a filter option shows. */
export function CountBadge({ count }: { count: number }) {
  return (
    <Badge
      variant="secondary"
      color="gray"
      size="xs"
      className="px-1 py-0 leading-4 tabular-nums"
    >
      {count}
    </Badge>
  );
}
