'use client';

import { ClockIcon } from 'lucide-react';
import * as React from 'react';

import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup
} from '@/components/ui/autocomplete';

// Adapted from the coss ui particle `p-calendar-25` (24-hour autocomplete time
// input): https://coss.com/ui/r/p-calendar-25.json

/** Every quarter of an hour, the suggestions the list offers. */
const TIMES = Array.from({ length: 96 }, (_, i) => {
  const hours = String(Math.floor(i / 4)).padStart(2, '0');
  const minutes = String((i % 4) * 15).padStart(2, '0');
  return `${hours}:${minutes}`;
});

/** Normalizes loose input ("9", "930", "9:5", "2150") to `HH:mm`, else null. */
function parseTime(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  let hours: number;
  let minutes: number;

  const colonMatch = /^(\d{1,2}):(\d{1,2})$/.exec(trimmed);
  if (colonMatch) {
    hours = Number(colonMatch[1]);
    minutes = Number(colonMatch[2]);
  } else {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 0 || digits.length > 4) {
      return null;
    }

    if (digits.length <= 2) {
      hours = Number(digits);
      minutes = 0;
    } else {
      // HMM → H:MM (215 → 02:15), HHMM → HH:MM (2150 → 21:50)
      hours = Number(digits.slice(0, -2));
      minutes = Number(digits.slice(-2));
    }
  }

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Live input formatting from a digit buffer:
 * - ≤2 digits: as-is
 * - 3 digits: H:MM (unpadded hour so a 4th digit can still become HHMM)
 * - 4 digits: HH:mm
 */
function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length === 3) {
    return Number(digits.slice(1)) <= 59
      ? `${digits[0]}:${digits.slice(1)}`
      : digits;
  }

  return parseTime(digits) ?? digits;
}

function filterTime(item: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return true;
  }

  if (item.startsWith(trimmed)) {
    return true;
  }

  const itemDigits = item.replace(/\D/g, '');
  const queryDigits = trimmed.replace(/\D/g, '');
  if (!queryDigits) {
    return false;
  }

  const itemHour = Number(itemDigits.slice(0, 2));
  const itemMinutes = itemDigits.slice(2);

  // Padded "0615" and unpadded "615" so "61" matches 06:15 while typing toward 615
  if (
    itemDigits.startsWith(queryDigits) ||
    `${itemHour}${itemMinutes}`.startsWith(queryDigits)
  ) {
    return true;
  }

  if (queryDigits.length >= 3) {
    return parseTime(queryDigits) === item;
  }

  const queryHour = Number(queryDigits);

  if (trimmed.includes(':')) {
    const minuteQuery = trimmed.split(':')[1]?.replace(/\D/g, '') ?? '';
    return (
      itemHour === queryHour &&
      (!minuteQuery || itemMinutes.startsWith(minuteQuery))
    );
  }

  if (queryDigits.length === 1) {
    return itemHour === queryHour || String(itemHour).startsWith(queryDigits);
  }

  return queryHour <= 23 && itemHour === queryHour;
}

interface TimeInputProps extends Omit<
  React.ComponentProps<typeof AutocompleteInput>,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'startAddon'
> {
  /** `HH:mm`, 24-hour. */
  value: string;
  /** Only ever called with a complete, valid `HH:mm`, or '' when cleared. */
  onValueChange: (value: string) => void;
  /** An optional time: a clear button inside the field empties it. */
  clearable?: boolean;
}

/**
 * A 24-hour time field: type a time freely or pick a quarter-hour from the
 * list. Anything that isn't a time snaps back to the last valid value on blur.
 */
function TimeInput({
  value,
  onValueChange,
  clearable = false,
  ...props
}: TimeInputProps) {
  const [text, setText] = React.useState(value);
  const [isEditing, setIsEditing] = React.useState(false);

  // Follow the value when it changes from outside (e.g. a form reset).
  const [lastValue, setLastValue] = React.useState(value);
  if (lastValue !== value) {
    setLastValue(value);
    setText(value);
  }

  const handleTextChange = (next: string) => {
    setIsEditing(true);
    const formatted = formatTimeInput(next);
    setText(formatted);

    if (clearable && formatted === '' && value !== '') {
      onValueChange('');
      return;
    }

    // List picks and completed HH:mm only — avoid committing mid-typing ("2:1" → 02:01)
    if (/^\d{2}:\d{2}$/.test(formatted) && formatted !== value) {
      onValueChange(formatted);
    }
  };

  const handleBlur = () => {
    const normalized = parseTime(text);
    setText(normalized ?? value);
    if (normalized && normalized !== value) {
      onValueChange(normalized);
    }
    setIsEditing(false);
  };

  const hasMatches = TIMES.some((item) =>
    filterTime(item, isEditing ? text : '')
  );

  return (
    <Autocomplete
      autoHighlight
      filter={(item: string, query) => filterTime(item, isEditing ? query : '')}
      items={TIMES}
      onValueChange={handleTextChange}
      openOnInputClick
      value={text}
    >
      <AutocompleteInput
        inputMode="numeric"
        maxLength={5}
        placeholder="HH:mm"
        startAddon={<ClockIcon aria-hidden="true" />}
        showClear={clearable && value !== ''}
        {...props}
        onBlur={handleBlur}
        onFocus={(event) => {
          setIsEditing(false);
          event.currentTarget.select();
        }}
      />
      <AutocompletePopup className={hasMatches ? undefined : 'hidden'}>
        <AutocompleteList>
          {(item: string) => (
            <AutocompleteItem key={item} value={item}>
              {item}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  );
}

export { parseTime, TimeInput };
