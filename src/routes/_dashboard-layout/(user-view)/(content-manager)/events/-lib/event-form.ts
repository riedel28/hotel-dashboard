import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  type EventCategory,
  eventCategorySchema,
  eventErrorCodes,
  type HotelEvent,
  type SaveEventData
} from 'shared/types/events';
import type { Property } from 'shared/types/properties';
import { z } from 'zod';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * The form holds times as the property's wall clock: dates YYYY-MM-DD and
 * times HH:mm, '' while not entered. They turn into instants only on save,
 * in the property's timezone rather than the browser's.
 */
export interface EventFormValues {
  title: string;
  description: string;
  categories: EventCategory[];
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  // On the start's date.
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

/** The rules the form checks, by code; the form words them. */
export const eventFormErrors = {
  required: 'required',
  startRequired: 'start_required',
  endRequired: 'end_required',
  endOrder: eventErrorCodes.endOrder,
  doorsOrder: eventErrorCodes.doorsOrder
} as const;

const required = z.string().trim().min(1, eventFormErrors.required);

export const eventFormSchema = z
  .object({
    title: required,
    description: z.string(),
    categories: z.array(eventCategorySchema),
    start_date: z.string(),
    start_time: z.string(),
    end_date: z.string(),
    end_time: z.string(),
    doors_time: z.string(),
    venue_name: required,
    address_line_1: required,
    address_line_2: z.string(),
    zip: required,
    city: required,
    country_code: required,
    image_ids: z.array(z.string())
  })
  .superRefine((values, ctx) => {
    const start = wallClock(values.start_date, values.start_time);
    const end = wallClock(values.end_date, values.end_time);
    const doors = wallClock(values.start_date, values.doors_time);

    if (!start) {
      ctx.addIssue({
        code: 'custom',
        path: ['start_date'],
        message: eventFormErrors.startRequired
      });
    }
    if (!end) {
      ctx.addIssue({
        code: 'custom',
        path: ['end_date'],
        message: eventFormErrors.endRequired
      });
    }
    // Wall clocks of one zone compare as strings.
    if (start && end && end <= start) {
      ctx.addIssue({
        code: 'custom',
        path: ['end_date'],
        message: eventFormErrors.endOrder
      });
    }
    if (start && doors && doors > start) {
      ctx.addIssue({
        code: 'custom',
        path: ['doors_time'],
        message: eventFormErrors.doorsOrder
      });
    }
  });

/** "YYYY-MM-DDTHH:mm", or null while either half is missing. */
function wallClock(date: string, time: string) {
  return date && time ? `${date}T${time}` : null;
}

function toInstant(date: string, time: string, zone: string) {
  return dayjs.tz(`${date}T${time}`, zone).toISOString();
}

/** An instant as the hotel's clock shows it. */
export const inZone = (instant: string, zone: string) =>
  dayjs(instant).tz(zone);

function fromInstant(instant: string, zone: string) {
  const local = inZone(instant, zone);
  return { date: local.format('YYYY-MM-DD'), time: local.format('HH:mm') };
}

/** A new event: nothing but the hotel's country. */
export function emptyEventValues(countryCode: string): EventFormValues {
  return {
    title: '',
    description: '',
    categories: [],
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
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
  const start = fromInstant(event.starts_at, zone);
  const end = fromInstant(event.ends_at, zone);
  return {
    title: event.title,
    description: event.description ?? '',
    categories: event.categories,
    start_date: start.date,
    start_time: start.time,
    end_date: end.date,
    end_time: end.time,
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
  values: EventFormValues,
  zone: string
): SaveEventData {
  return {
    title: values.title,
    // The editor reports an empty document as ''.
    description: values.description || null,
    categories: values.categories,
    starts_at: toInstant(values.start_date, values.start_time, zone),
    ends_at: toInstant(values.end_date, values.end_time, zone),
    doors_open_at: values.doors_time
      ? toInstant(values.start_date, values.doors_time, zone)
      : null,
    venue_name: values.venue_name,
    address_line_1: values.address_line_1,
    address_line_2: values.address_line_2 || null,
    zip: values.zip,
    city: values.city,
    country_code: values.country_code,
    image_ids: values.image_ids
  };
}

/** Minutes from the start to the end, counted in real time (DST-aware). */
export function durationMinutes(values: EventFormValues, zone: string) {
  if (!wallClock(values.start_date, values.start_time)) return null;
  if (!wallClock(values.end_date, values.end_time)) return null;
  return dayjs(toInstant(values.end_date, values.end_time, zone)).diff(
    toInstant(values.start_date, values.start_time, zone),
    'minute'
  );
}

/** Minutes the doors open before the start, or null without both times. */
export function doorsLeadMinutes(values: EventFormValues) {
  if (!values.start_time || !values.doors_time) return null;
  return minutesOf(values.start_time) - minutesOf(values.doors_time);
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

type AddressFields = Pick<
  EventFormValues,
  'address_line_1' | 'address_line_2' | 'zip' | 'city' | 'country_code'
>;

/**
 * The hotel's address in the event's address fields, the venue name left
 * alone. Null when the hotel has no address yet.
 */
export function hotelAddress(
  property: Pick<
    Property,
    'address_line_1' | 'address_line_2' | 'zip' | 'city' | 'country_code'
  >
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
