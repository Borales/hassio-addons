import { z } from 'zod';

type ValidationMessages = {
  required: string;
  invalid: string;
  tooShort: string;
  tooLong: string;
};

/**
 * Factory function that creates a Zod schema for group name validation with translated messages.
 * Only lowercase alphanumeric characters, underscores, and hyphens allowed.
 */
export function createGroupNameSchema(messages: ValidationMessages) {
  return z
    .string()
    .min(1, messages.tooShort)
    .max(50, messages.tooLong)
    .regex(/^[a-z0-9_-]+$/, messages.invalid);
}

/**
 * Factory function that creates a full group schema for create/update operations with translated messages.
 */
export function createGroupSchema(messages: ValidationMessages) {
  return z.object({
    name: createGroupNameSchema(messages),
    description: z
      .string()
      .max(500, 'Description must be at most 500 characters')
      .optional(),
    secretIds: z.array(z.string()).optional()
  });
}

// Type inference helper - uses default English messages
const defaultSchema = createGroupSchema({
  required: 'Group name is required',
  invalid:
    'Group name must contain only lowercase letters, numbers, underscores, and hyphens',
  tooShort: 'Group name must be at least 1 character',
  tooLong: 'Group name must be at most 50 characters'
});

export type GroupInput = z.infer<typeof defaultSchema>;

