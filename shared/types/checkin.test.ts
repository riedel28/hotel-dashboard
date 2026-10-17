import { describe, expect, test } from 'vitest';

import {
  checkinErrorCodes,
  defaultCheckinSettings,
  type SaveCheckinSettingsData,
  saveCheckinSettingsSchema
} from './checkin';

const errors = (overrides: Partial<SaveCheckinSettingsData>) => {
  const result = saveCheckinSettingsSchema.safeParse({
    ...defaultCheckinSettings,
    ...overrides
  });
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

describe('saveCheckinSettingsSchema', () => {
  test('takes the defaults', () => {
    expect(errors({})).toEqual([]);
  });

  test('wants the reminder strictly closer to arrival than the first send', () => {
    const reminderError = [checkinErrorCodes.reminderNotBeforeFirstSend];
    expect(errors({ first_send_days: 2, reminder_days: 2 })).toEqual(
      reminderError
    );
    expect(errors({ first_send_days: 1, reminder_days: 3 })).toEqual(
      reminderError
    );
    expect(errors({ first_send_days: 2, reminder_days: 1 })).toEqual([]);
  });

  test('takes no reminder, whatever the first send', () => {
    expect(errors({ first_send_days: 1, reminder_days: null })).toEqual([]);
  });

  test('does not check the reminder while links are not sent', () => {
    expect(
      errors({ auto_send: false, first_send_days: 1, reminder_days: 3 })
    ).toEqual([]);
  });

  test('wants an image for a custom background', () => {
    expect(errors({ background: 'custom' })).toEqual([
      checkinErrorCodes.customImageRequired
    ]);
  });
});
