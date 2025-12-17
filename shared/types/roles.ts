import { z } from 'zod';

export const roleSchema = z.object({
  id: z.number(),
  name: z.string()
});

export const rolesSchema = z.array(roleSchema);

export type Role = z.infer<typeof roleSchema>;
