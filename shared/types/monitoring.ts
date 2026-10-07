import { z } from 'zod';

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

const dateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'must be an ISO date'
  });

export const sortableMonitoringColumnsSchema = z.enum([
  'logged_at',
  'status',
  'type',
  'booking_nr',
  'event'
]);

export const fetchMonitoringLogsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => [5, 10, 25, 50, 100].includes(val), {
      message: 'per_page must be one of: 5, 10, 25, 50, 100'
    })
    .default(50),
  q: z.string().max(200).optional(),
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
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  sort_by: sortableMonitoringColumnsSchema.default('logged_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
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
