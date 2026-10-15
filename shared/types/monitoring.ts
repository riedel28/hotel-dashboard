import { z } from 'zod';

import {
  isoDateStringSchema,
  pageSchema,
  perPageSchema,
  searchQuerySchema,
  sortOrderSchema
} from './list-params';

export const monitoringStatusSchema = z.enum(['success', 'error']);

export const monitoringTypeSchema = z.enum(['pms', 'door lock', 'payment']);

export const monitoringPeriodSchema = z.enum(['1h', '24h', '7d', '30d']);

export const monitoringLogSchema = z.object({
  id: z.number(),
  status: monitoringStatusSchema,
  logged_at: z.coerce.date(),
  type: monitoringTypeSchema,
  booking_nr: z.string().nullable(),
  // id of the reservation with this booking_nr, when one exists
  reservation_id: z.number().nullable(),
  event: z.string(),
  sub: z.string().nullable(),
  log_message: z.string().nullable()
});

export const sortableMonitoringColumnsSchema = z.enum([
  'logged_at',
  'status',
  'type',
  'booking_nr',
  'event'
]);

export const fetchMonitoringLogsParamsSchema = z.object({
  page: pageSchema.default(1),
  per_page: perPageSchema.default(50),
  q: searchQuerySchema.optional(),
  status: monitoringStatusSchema.optional(),
  // A list; a query string spells it comma-separated ("pms,payment")
  type: z
    .preprocess(
      (value) => (typeof value === 'string' ? value.split(',') : value),
      z.array(monitoringTypeSchema)
    )
    .optional(),
  booking_nr: z.string().max(200).optional(),
  // Relative window ending now; ignored when from/to are given
  period: monitoringPeriodSchema.optional(),
  // ISO date or datetime, both bounds inclusive
  from: isoDateStringSchema.optional(),
  to: isoDateStringSchema.optional(),
  sort_by: sortableMonitoringColumnsSchema.default('logged_at'),
  sort_order: sortOrderSchema.default('desc')
});

export const monitoringLogIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const fetchMonitoringLogsResponseSchema = z.object({
  index: z.array(monitoringLogSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  // Per-status totals under every active filter except `status` itself
  counts: z.object({
    all: z.number().int().nonnegative(),
    success: z.number().int().nonnegative(),
    error: z.number().int().nonnegative()
  }),
  page_count: z.number().int().nonnegative()
});

export type MonitoringStatus = z.infer<typeof monitoringStatusSchema>;
export type MonitoringType = z.infer<typeof monitoringTypeSchema>;
export type MonitoringPeriod = z.infer<typeof monitoringPeriodSchema>;
export type MonitoringLog = z.infer<typeof monitoringLogSchema>;
export type FetchMonitoringLogsParams = z.infer<
  typeof fetchMonitoringLogsParamsSchema
>;
export type FetchMonitoringLogsResponse = z.infer<
  typeof fetchMonitoringLogsResponseSchema
>;
