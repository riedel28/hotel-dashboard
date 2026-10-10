import { z } from 'zod';

const messageSchema = z
  .string()
  .trim()
  .min(1, 'Message is required')
  .max(2000, 'Message must be at most 2000 characters');

// As much of a user as a worklog card shows.
export const worklogUserSchema = z.object({
  id: z.number().int().positive(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string(),
  avatar_url: z.string().nullable()
});

export const worklogSchema = z.object({
  id: z.number().int().positive(),
  property_id: z.uuid(),
  message: z.string().min(1),
  created_at: z.iso.datetime(),
  // Null once the user has been deleted.
  created_by: worklogUserSchema.nullable(),
  // Null until the first edit.
  updated_at: z.iso.datetime().nullable(),
  updated_by: worklogUserSchema.nullable()
});

// The whole log of a property, newest first.
export const fetchWorklogsResponseSchema = z.array(worklogSchema);

export const worklogMessageSchema = z.object({ message: messageSchema });

export const worklogParamsSchema = z.object({
  id: z.uuid(),
  worklogId: z.coerce.number().int().positive()
});

export type WorklogUser = z.infer<typeof worklogUserSchema>;
export type Worklog = z.infer<typeof worklogSchema>;
export type WorklogMessageData = z.infer<typeof worklogMessageSchema>;
