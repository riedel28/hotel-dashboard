import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  type EventCategory,
  eventCategorySchema,
  eventErrorCodes,
  eventTextFields,
  type HotelEvent,
  type SaveEventData
} from 'shared/types/events';
import type { Property } from 'shared/types/properties';
import { z } from 'zod';

import type { WallClock } from '@/components/date-time-field';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * The form holds times as the property's wall clock. They turn into instants
 * only on save, in the property's timezone rather than the browser's.
 */
export interface EventFormValues {
  title: string;
  description: string;
  categories: EventCategory[];
  start: WallClock;
  end: WallClock;
  // HH:mm on the start's date, '' for none.
  doors_time: string;
  venue_name: string;
  address_line_1: string;
  address_line_2: string;
  zip: string;
  city: string;
  country_code: string;
  // In order; the first is the cover.
  image_ids: string[];
}

const wallClockSchema = z.object({ date: z.string(), time: z.string() });

// The text fields are checked as the API checks them, with the same codes.
export const eventFormSchema = z
  .object({
    ...eventTextFields,
    description: z.string(),
    categories: z.array(eventCategorySchema),
    start: wallClockSchema,
    end: wallClockSchema,
    doors_time: z.string(),
    address_line_2: z.string(),
    country_code: z.string().min(1, eventErrorCodes.countryRequired),
    image_ids: z.array(z.string())
  })
  .superRefine((values, ctx) => {
    const start = stamp(values.start);
    const end = stamp(values.end);
    const doors = stamp({ date: values.start.date, time: values.doors_time });
    const issue = (path: keyof EventFormValues, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message });

    if (!start) issue('start', eventErrorCodes.startRequired);
    if (!end) issue('end', eventErrorCodes.endRequired);
    // Wall clocks of one zone compare as strings.
    if (start && end && end <= start) issue('end', eventErrorCodes.endOrder);
    if (start && doors && doors > start) {
      issue('doors_time', eventErrorCodes.doorsOrder);
    }
  });

/** "YYYY-MM-DDTHH:mm", or null while either half is missing. */
function stamp({ date, time }: WallClock) {
  return date && time ? `${date}T${time}` : null;
}

function toInstant({ date, time }: WallClock, zone: string) {
  return dayjs.tz(`${date}T${time}`, zone).toISOString();
}

/** An instant as the hotel's clock shows it. */
export const inZone = (instant: string, zone: string) =>
  dayjs(instant).tz(zone);

function fromInstant(instant: string, zone: string): WallClock {
  const local = inZone(instant, zone);
  return { date: local.format('YYYY-MM-DD'), time: local.format('HH:mm') };
}

const noTime: WallClock = { date: '', time: '' };

/** A new event: nothing but the hotel's country. */
export function emptyEventValues(countryCode: string): EventFormValues {
  return {
    title: '',
    description: '',
    categories: [],
    start: noTime,
    end: noTime,
    doors_time: '',
    venue_name: '',
    address_line_1: '',
    address_line_2: '',
    zip: '',
    city: '',
    country_code: countryCode,
    image_ids: []
  };
}

export function eventToFormValues(
  event: HotelEvent,
  zone: string
): EventFormValues {
  return {
    title: event.title,
    description: event.description ?? '',
    categories: event.categories,
    start: fromInstant(event.starts_at, zone),
    end: fromInstant(event.ends_at, zone),
    doors_time: event.doors_open_at
      ? fromInstant(event.doors_open_at, zone).time
      : '',
    venue_name: event.venue_name,
    address_line_1: event.address_line_1,
    address_line_2: event.address_line_2 ?? '',
    zip: event.zip,
    city: event.city,
    country_code: event.country_code,
    image_ids: event.image_ids
  };
}

/** What Duplicate opens the new-event form with. */
export function duplicateValues(
  event: HotelEvent,
  zone: string
): EventFormValues {
  const values = eventToFormValues(event, zone);
  return { ...values, title: `${values.title} (copy)` };
}

/** The values of a valid form, as the API takes them. */
export function formValuesToSaveData(
  { start, end, doors_time, ...values }: EventFormValues,
  zone: string
): SaveEventData {
  return {
    ...values,
    // The editor reports an empty document as ''.
    description: values.description || null,
    starts_at: toInstant(start, zone),
    ends_at: toInstant(end, zone),
    doors_open_at: doors_time
      ? toInstant({ date: start.date, time: doors_time }, zone)
      : null,
    address_line_2: values.address_line_2 || null
  };
}

/** Minutes from the start to the end, counted in real time (DST-aware). */
export function durationMinutes(
  start: WallClock,
  end: WallClock,
  zone: string
) {
  if (!stamp(start) || !stamp(end)) return null;
  return dayjs(toInstant(end, zone)).diff(toInstant(start, zone), 'minute');
}

/** Minutes the doors open before the start, or null without both times. */
export function doorsLeadMinutes(startTime: string, doorsTime: string) {
  if (!startTime || !doorsTime) return null;
  return minutesOf(startTime) - minutesOf(doorsTime);
}

export const doorsPresets = [30, 60, 120] as const;

/**
 * The doors time `minutes` before a start time, or null when that falls on
 * the previous day: the doors share the start's date.
 */
export function doorsTimeBefore(startTime: string, minutes: number) {
  if (!startTime) return null;
  const doors = minutesOf(startTime) - minutes;
  if (doors < 0) return null;
  return `${pad(Math.floor(doors / 60))}:${pad(doors % 60)}`;
}

function minutesOf(time: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Minutes as days, hours and minutes, for "1 d 3 h 30 min". */
export function splitMinutes(total: number) {
  return {
    days: Math.floor(total / 1440),
    hours: Math.floor((total % 1440) / 60),
    minutes: total % 60
  };
}

/** The fields "Use hotel address" fills. */
export const addressFieldNames = [
  'address_line_1',
  'address_line_2',
  'zip',
  'city',
  'country_code'
] as const;

type AddressFields = Pick<EventFormValues, (typeof addressFieldNames)[number]>;

/**
 * The hotel's address in the event's address fields, the venue name left
 * alone. Null when the hotel has no address yet.
 */
export function hotelAddress(
  property: Pick<Property, keyof AddressFields>
): AddressFields | null {
  if (!property.address_line_1 || !property.zip || !property.city) {
    return null;
  }
  return {
    address_line_1: property.address_line_1,
    address_line_2: property.address_line_2 ?? '',
    zip: property.zip,
    city: property.city,
    country_code: property.country_code
  };
}
