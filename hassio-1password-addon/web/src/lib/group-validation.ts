import { z } from 'zod';

/**
 * Zod schema for group name validation.
 * Only lowercase alphanumeric characters, underscores, and hyphens allowed.
 */
export const groupNameSchema = z
  .string()
  .min(2, 'Group name must be at least 2 characters')
  .max(50, 'Group name must be at most 50 characters')
  .regex(
    /^[a-z0-9_-]+$/,
    'Group name must contain only lowercase letters, numbers, underscores, and hyphens'
  );

/**
 * Full group schema for create/update operations.
 */
export const groupSchema = z.object({
  name: groupNameSchema,
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  secretIds: z.array(z.string()).optional()
});

export type GroupInput = z.infer<typeof groupSchema>;
