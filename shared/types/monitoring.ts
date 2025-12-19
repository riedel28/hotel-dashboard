import { z } from 'zod';

export const monitoringStatusSchema = z.enum(['success', 'error']);

export const monitoringTypeSchema = z.enum(['pms', 'door lock', 'payment']);

export const monitoringLogSchema = z.object({
  id: z.number(),
  status: monitoringStatusSchema,
  date: z.coerce.date(),
  type: monitoringTypeSchema,
  booking_nr: z.string().nullable(),
  event: z.string(),
  sub: z.string().nullable(),
  log_message: z.string().nullable()
});

export const sortableMonitoringColumnsSchema = z.enum([
  'date',
  'status',
  'type',
  'booking_nr',
  'event'
]);

export const fetchMonitoringLogsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  per_page: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => [5, 10, 25, 50, 100].includes(val), {
      message: 'per_page must be one of: 5, 10, 25, 50, 100'
    })
    .default(10)
    .optional(),
  q: z.string().optional(),
  status: monitoringStatusSchema.optional(),
  type: monitoringTypeSchema.optional(),
  from: z.string().optional(), // ISO date string
  to: z.string().optional(),   // ISO date string
  sort_by: sortableMonitoringColumnsSchema.default('date').optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc').optional()
});

export const fetchMonitoringLogsResponseSchema = z.object({
  index: z.array(monitoringLogSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  page_count: z.number().int().nonnegative()
});

export type MonitoringStatus = z.infer<typeof monitoringStatusSchema>;
export type MonitoringType = z.infer<typeof monitoringTypeSchema>;
export type MonitoringLog = z.infer<typeof monitoringLogSchema>;
export type FetchMonitoringLogsParams = z.infer<
  typeof fetchMonitoringLogsParamsSchema
>;
export type FetchMonitoringLogsResponse = z.infer<
  typeof fetchMonitoringLogsResponseSchema
>;

