import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import type { DeviceRoom } from 'shared/types/devices';

import { deviceRoomOptionsQueryOptions } from '@/api/devices';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';

import {
  groupRoomsByFloor,
  matchesRoomQuery,
  roomLabel
} from '../-lib/devices';

type FloorGroup = ReturnType<typeof groupRoomsByFloor>[number];

interface RoomPickerProps {
  value: DeviceRoom | null;
  onValueChange: (room: DeviceRoom) => void;
  /** The trigger's content: the selected room or a call to action. */
  children: ReactNode;
  /**
   * An action under the list, shown while a room is selected — unassigning in
   * the table, clearing the field in a form.
   */
  clearLabel?: ReactNode;
  onClear?: () => void;
  /** Tints the action red on hover, for one that undoes saved state. */
  isClearDestructive?: boolean;
  className?: string;
  /** For the popup, e.g. to match the width of a form field. */
  contentClassName?: string;
  id?: string;
  'aria-label'?: string;
}

/**
 * The rooms of the property grouped by floor, with a search by room number.
 * Occupied rooms stay selectable: a room can hold several devices.
 */
export function RoomPicker({
  value,
  onValueChange,
  children,
  clearLabel,
  onClear,
  isClearDestructive = false,
  className,
  contentClassName,
  id,
  'aria-label': ariaLabel
}: RoomPickerProps) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const roomsQuery = useQuery({
    ...deviceRoomOptionsQueryOptions(),
    enabled: open
  });
  const groups = useMemo(
    () => groupRoomsByFloor(roomsQuery.data ?? []),
    [roomsQuery.data]
  );

  return (
    <Combobox
      items={groups}
      value={value}
      onValueChange={(room: DeviceRoom | null) => room && onValueChange(room)}
      open={open}
      onOpenChange={setOpen}
      isItemEqualToValue={(a: DeviceRoom, b: DeviceRoom) => a.id === b.id}
      itemToStringLabel={roomLabel}
      filter={matchesRoomQuery}
    >
      <ComboboxTrigger id={id} aria-label={ariaLabel} className={className}>
        {children}
      </ComboboxTrigger>
      <ComboboxContent className={cn('w-56', contentClassName)}>
        <ComboboxInput
          variant="popup"
          placeholder={t`Room number`}
          aria-label={t`Search rooms`}
          iconLeft={
            <SearchIcon
              className="size-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          }
          showTrigger={false}
        />
        {roomsQuery.isPending ? (
          // Three bars, a little lower than a room option, like the property selector's
          // loading state
          <ComboboxEmpty className="flex-col gap-1 p-1">
            <span className="sr-only">
              <Trans>Loading rooms…</Trans>
            </span>
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="h-6 w-full rounded-md bg-muted"
              />
            ))}
          </ComboboxEmpty>
        ) : (
          <ComboboxEmpty className="py-6">
            {roomsQuery.isError ? (
              <Trans>Failed to load rooms</Trans>
            ) : (
              <Trans>No rooms found</Trans>
            )}
          </ComboboxEmpty>
        )}
        <ComboboxList>
          {(group: FloorGroup) => (
            <ComboboxGroup key={group.floor ?? 'none'} items={group.items}>
              <ComboboxLabel>
                {group.floor === null ? (
                  <Trans>No floor</Trans>
                ) : (
                  <Trans>Floor {group.floor}</Trans>
                )}
              </ComboboxLabel>
              <ComboboxCollection>
                {(room: DeviceRoom) => (
                  <ComboboxItem key={room.id} value={room} className="pl-4">
                    <span className="tabular-nums">{roomLabel(room)}</span>
                    {room.room_number && room.name !== room.room_number && (
                      <span className="truncate text-muted-foreground">
                        {room.name}
                      </span>
                    )}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
        {value && onClear && (
          <div className="border-t border-border p-1">
            <button
              type="button"
              className={cn(
                'w-full cursor-default rounded-sm px-2 py-1.5 text-left text-sm outline-hidden',
                // Either way it reads as a plain item until hovered or focused
                isClearDestructive
                  ? 'hover:bg-destructive/10 hover:text-danger focus-visible:bg-destructive/10 focus-visible:text-danger'
                  : 'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground'
              )}
              onClick={() => {
                setOpen(false);
                onClear();
              }}
            >
              {clearLabel}
            </button>
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
