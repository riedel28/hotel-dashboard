import { useLingui } from '@lingui/react/macro';
import { type Ref, useMemo } from 'react';
import { type EventCategory, eventCategorySchema } from 'shared/types/events';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor
} from '@/components/ui/combobox';

import { eventCategoryLabels } from '../-lib/event-categories';

interface CategoryItem {
  value: EventCategory;
  label: string;
}

interface CategoryPickerProps {
  id?: string;
  value: EventCategory[];
  onValueChange: (value: EventCategory[]) => void;
  ref?: Ref<HTMLInputElement>;
}

/** Categories as removable chips, more picked by searching the list. */
export function CategoryPicker({
  id,
  value,
  onValueChange,
  ref
}: CategoryPickerProps) {
  const { t } = useLingui();
  const anchor = useComboboxAnchor();

  const items: CategoryItem[] = useMemo(
    () =>
      eventCategorySchema.options.map((category) => ({
        value: category,
        label: t(eventCategoryLabels[category])
      })),
    [t]
  );
  const selected = items.filter((item) => value.includes(item.value));

  return (
    <Combobox
      multiple
      // Enter picks the first match instead of submitting the form
      autoHighlight
      items={items}
      value={selected}
      onValueChange={(next: CategoryItem[]) =>
        // Catalog order, whatever the pick order.
        onValueChange(
          items
            .filter((item) =>
              next.some((picked) => picked.value === item.value)
            )
            .map((item) => item.value)
        )
      }
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxChips ref={anchor}>
        {selected.map((item) => (
          <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
        ))}
        <ComboboxChipsInput
          ref={ref}
          id={id}
          placeholder={selected.length === 0 ? t`Add categories` : undefined}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty className="py-6 text-center text-sm text-muted-foreground">
          {t`No category found.`}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: CategoryItem) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
