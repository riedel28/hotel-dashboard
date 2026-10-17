import { eq } from 'drizzle-orm';

import {
  type CheckinSettings,
  checkinSettingsSchema,
  defaultCheckinSettings,
  type SaveCheckinSettingsData
} from '../../../shared/types/checkin';
import { assertImagesOwned, rethrowGoneImage } from '../db/image-queries';
import { db } from '../db/pool';
import { checkinSettings, properties } from '../db/schema';
import { withFailMessage } from '../middleware/error';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';

const handle = withFailMessage<SelectedPropertyRequest>;

// The settings as the API returns them: a property that never switched
// check-in on gets the defaults, switched off.
async function findSettings(propertyId: string): Promise<CheckinSettings> {
  const [row] = await db
    .select({
      pwa_domain: properties.pwa_domain,
      settings: {
        enabled: checkinSettings.enabled,
        payment_mode: checkinSettings.payment_mode,
        auto_send: checkinSettings.auto_send,
        first_send_days: checkinSettings.first_send_days,
        reminder_days: checkinSettings.reminder_days,
        background: checkinSettings.background,
        custom_image_id: checkinSettings.custom_image_id
      }
    })
    .from(properties)
    .leftJoin(checkinSettings, eq(checkinSettings.property_id, properties.id))
    .where(eq(properties.id, propertyId));

  return checkinSettingsSchema.parse({
    enabled: false,
    ...defaultCheckinSettings,
    // Null without a row
    ...row?.settings,
    // ponytail: the guest app's path is assumed; move it into the property
    // once the guest app exists and settles on one.
    guest_url: row?.pwa_domain ? `https://${row.pwa_domain}/checkin` : null
  });
}

const getCheckinSettings = handle(
  'Failed to fetch check-in settings',
  async (req, res) => {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;
    res.status(200).json(await findSettings(propertyId));
  }
);

// Saves the form; whether check-in is on is left as it is (off for a
// property saving before its first activation).
const saveCheckinSettings = handle(
  'Failed to save check-in settings',
  async (req, res) => {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;

    // Body is validated by validateBody(saveCheckinSettingsSchema).
    const values = req.body as SaveCheckinSettingsData;
    const imageIds = values.custom_image_id ? [values.custom_image_id] : [];
    await assertImagesOwned(db, propertyId, imageIds);

    const row = { ...values, updated_at: new Date() };
    await db
      .insert(checkinSettings)
      .values({ property_id: propertyId, enabled: false, ...row })
      .onConflictDoUpdate({ target: checkinSettings.property_id, set: row })
      .catch(rethrowGoneImage);

    res.status(200).json(await findSettings(propertyId));
  }
);

// Switching on for the first time stores the defaults; switching off keeps
// the settings for the next time.
const setCheckinEnabled = handle(
  'Failed to switch online check-in',
  async (req, res) => {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;

    const { enabled } = req.body as { enabled: boolean };
    await db
      .insert(checkinSettings)
      .values({ property_id: propertyId, enabled, ...defaultCheckinSettings })
      .onConflictDoUpdate({
        target: checkinSettings.property_id,
        set: { enabled, updated_at: new Date() }
      });

    res.status(200).json(await findSettings(propertyId));
  }
);

export { getCheckinSettings, saveCheckinSettings, setCheckinEnabled };
