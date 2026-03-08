import {
  createGroupNameSchema,
  createTranslatedGroupNameSchema
} from '@/lib/group-validation';
import { describe, expect, it, vi } from 'vitest';

const messages = {
  required: 'required',
  invalid: 'invalid',
  tooShort: 'too short',
  tooLong: 'too long'
};

describe('createGroupNameSchema', () => {
  const schema = createGroupNameSchema(messages);

  it('accepts valid lowercase names', () => {
    expect(schema.safeParse('my-group').success).toBe(true);
    expect(schema.safeParse('my_group').success).toBe(true);
    expect(schema.safeParse('group123').success).toBe(true);
    expect(schema.safeParse('ab').success).toBe(true);
  });

  it('accepts names with only numbers', () => {
    expect(schema.safeParse('12').success).toBe(true);
  });

  it('accepts names at max length (50 chars)', () => {
    expect(schema.safeParse('a'.repeat(50)).success).toBe(true);
  });

  it('rejects names shorter than 2 characters', () => {
    const result = schema.safeParse('a');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(messages.tooShort);
    }
  });

  it('rejects empty string', () => {
    const result = schema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects names longer than 50 characters', () => {
    const result = schema.safeParse('a'.repeat(51));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(messages.tooLong);
    }
  });

  it('rejects names with uppercase letters', () => {
    const result = schema.safeParse('MyGroup');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(messages.invalid);
    }
  });

  it('rejects names with spaces', () => {
    const result = schema.safeParse('my group');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(messages.invalid);
    }
  });

  it('rejects names with special characters', () => {
    expect(schema.safeParse('my@group').success).toBe(false);
    expect(schema.safeParse('my.group').success).toBe(false);
    expect(schema.safeParse('my/group').success).toBe(false);
  });

  it('returns correct error messages', () => {
    const customMessages = {
      required: 'Name is required',
      invalid: 'Only a-z, 0-9, _, - allowed',
      tooShort: 'Minimum 2 characters',
      tooLong: 'Maximum 50 characters'
    };
    const customSchema = createGroupNameSchema(customMessages);

    const tooShort = customSchema.safeParse('a');
    expect(tooShort.success).toBe(false);
    if (!tooShort.success) {
      expect(tooShort.error.issues[0].message).toBe(customMessages.tooShort);
    }

    const invalid = customSchema.safeParse('Invalid!');
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0].message).toBe(customMessages.invalid);
    }
  });
});

describe('createTranslatedGroupNameSchema', () => {
  it('calls t() with the correct translation keys', () => {
    const t = vi.fn((key: string) => key);
    createTranslatedGroupNameSchema(t);

    expect(t).toHaveBeenCalledWith('required');
    expect(t).toHaveBeenCalledWith('invalid');
    expect(t).toHaveBeenCalledWith('tooShort');
    expect(t).toHaveBeenCalledWith('tooLong');
  });

  it('returns a working schema using translated messages', () => {
    const t = (key: string) => `translated.${key}`;
    const schema = createTranslatedGroupNameSchema(t);

    expect(schema.safeParse('valid-name').success).toBe(true);

    const invalid = schema.safeParse('INVALID');
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0].message).toBe('translated.invalid');
    }
  });
});
