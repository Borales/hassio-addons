import { z } from 'zod';

export type ValidationMessages = {
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
    .min(2, messages.tooShort)
    .max(50, messages.tooLong)
    .regex(/^[a-z0-9_-]+$/, messages.invalid);
}

/**
 * Creates a group name validation schema using a next-intl translation function.
 * Reduces boilerplate when creating schemas in server actions and components.
 */
export function createTranslatedGroupNameSchema(t: (key: string) => string) {
  return createGroupNameSchema({
    required: t('required'),
    invalid: t('invalid'),
    tooShort: t('tooShort'),
    tooLong: t('tooLong')
  });
}
