import { Plural, Trans, useLingui } from '@lingui/react/macro';
import type { RoomImportPreview } from 'shared/types/room-imports';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface PreviewDeletionsProps {
  deletions: RoomImportPreview['deletions'];
  /** How many of them will really go: those a reservation keeps are not counted */
  deleteCount: number;
  isConfirmed: boolean;
  onConfirmedChange: (isConfirmed: boolean) => void;
}

/** Replace mode: the rooms the file leaves out, and the consent to delete them. */
export function PreviewDeletions({
  deletions,
  deleteCount,
  isConfirmed,
  onConfirmedChange
}: PreviewDeletionsProps) {
  const { t } = useLingui();

  return (
    <section
      aria-label={t`Rooms to delete`}
      className="overflow-hidden rounded-lg border border-danger/40"
    >
      <div className="space-y-2 p-3">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Trans>Rooms that are not in the file</Trans>
          <span className="font-normal text-muted-foreground tabular-nums">
            {deletions.length}
          </span>
        </h3>
        <ul className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto text-xs">
          {deletions.map((room) => (
            <li
              key={room.id}
              className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1"
            >
              <span className="font-medium">{room.room_number}</span>
              {room.name !== room.room_number && (
                <span className="text-muted-foreground">{room.name}</span>
              )}
              {room.has_active_reservation && (
                <Badge variant="outline" size="xs" color="yellow">
                  <Trans>Active reservation — will be skipped</Trans>
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </div>
      {deleteCount > 0 && (
        <label className="flex items-center gap-2 border-t border-danger/40 bg-danger/5 px-3 py-2.5 text-sm font-medium">
          <Checkbox
            checked={isConfirmed}
            onCheckedChange={(checked) => onConfirmedChange(checked === true)}
          />
          <Plural
            value={deleteCount}
            one="I understand that # room will be deleted"
            other="I understand that # rooms will be deleted"
          />
        </label>
      )}
    </section>
  );
}
