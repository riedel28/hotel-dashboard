import { z } from 'zod';

// Online check-in: guests get a link by email and check in before they
// arrive, in the guest app. These are the property's settings for it.

// TODO: only "active" is known so far; add the other payment modes here.
export const checkinPaymentModeSchema = z.enum(['active']);

export const firstSendDaysOptions = [1, 2, 3, 5, 7, 14] as const;
export const reminderDaysOptions = [1, 2, 3] as const;

export const checkinBackgroundPresetSchema = z.enum([
  'lobby',
  'reception',
  'corridor',
  'entrance'
]);

// Photos from Unsplash (free to use, no attribution required), served by its
// CDN; add `?w=…&q=…&auto=format&fit=crop` for the size needed.
// ponytail: hotlinked; copy them into our own storage if Unsplash ever drops
// one or the guest app needs to work offline.
export const checkinBackgroundPresetPhotos: Record<
  CheckinBackgroundPreset,
  string
> = {
  lobby: 'https://images.unsplash.com/photo-1621293954908-907159247fc8',
  reception: 'https://images.unsplash.com/photo-1759038085950-1234ca8f5fed',
  corridor: 'https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa',
  entrance: 'https://images.unsplash.com/photo-1761778364718-a19ee94c1209'
};

export const checkinBackgroundSchema = z.union([
  z.literal('none'),
  z.literal('custom'),
  checkinBackgroundPresetSchema
]);

export const checkinBackgroundMaxBytes = 5 * 1024 * 1024;
// Smaller ones are accepted, with a warning: they look blurry on a desktop.
export const checkinBackgroundMinSize = { width: 1920, height: 1080 };

/** What the schemas report, by code; the admin words each one. */
export const checkinErrorCodes = {
  reminderNotBeforeFirstSend: 'checkin_reminder_not_before_first_send',
  customImageRequired: 'checkin_custom_image_required'
} as const;

/** The settings the form saves; `enabled` is switched on its own. */
export const saveCheckinSettingsSchema = z
  .object({
    payment_mode: checkinPaymentModeSchema,
    auto_send: z.boolean(),
    first_send_days: z.literal(firstSendDaysOptions),
    // Null: no reminder.
    reminder_days: z.literal(reminderDaysOptions).nullable(),
    background: checkinBackgroundSchema,
    // Kept when another background is picked, so the hotel can go back to it.
    custom_image_id: z.uuid().nullable()
  })
  .superRefine((data, ctx) => {
    // Checked only while links go out: the fields can't be edited otherwise.
    if (
      data.auto_send &&
      data.reminder_days !== null &&
      data.reminder_days >= data.first_send_days
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['reminder_days'],
        message: checkinErrorCodes.reminderNotBeforeFirstSend
      });
    }
    if (data.background === 'custom' && data.custom_image_id === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['custom_image_id'],
        message: checkinErrorCodes.customImageRequired
      });
    }
  });

export const checkinSettingsSchema = z.object({
  enabled: z.boolean(),
  payment_mode: checkinPaymentModeSchema,
  auto_send: z.boolean(),
  first_send_days: z.literal(firstSendDaysOptions),
  reminder_days: z.literal(reminderDaysOptions).nullable(),
  background: checkinBackgroundSchema,
  custom_image_id: z.uuid().nullable(),
  // Where guests check in; null while the property has no guest app domain.
  guest_url: z.url().nullable()
});

export const setCheckinEnabledSchema = z.object({ enabled: z.boolean() });

export const defaultCheckinSettings: SaveCheckinSettingsData = {
  payment_mode: 'active',
  auto_send: true,
  first_send_days: 5,
  reminder_days: 1,
  background: 'none',
  custom_image_id: null
};

export type CheckinPaymentMode = z.infer<typeof checkinPaymentModeSchema>;
export type CheckinBackground = z.infer<typeof checkinBackgroundSchema>;
export type CheckinBackgroundPreset = z.infer<
  typeof checkinBackgroundPresetSchema
>;
export type SaveCheckinSettingsData = z.infer<typeof saveCheckinSettingsSchema>;
export type CheckinSettings = z.infer<typeof checkinSettingsSchema>;
