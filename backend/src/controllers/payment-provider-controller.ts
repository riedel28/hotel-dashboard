import { and, eq } from 'drizzle-orm';
import type { Response } from 'express';

import type { SavedPaymentProviderData } from '../../../shared/types/payment-provider';
import { db } from '../db/pool';
import { paymentProviderConfigs } from '../db/schema';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';
import { encryptSecret } from '../utils/secret-box';

// The API key never leaves the server: the client only learns that one is set.
function transformConfig(row: typeof paymentProviderConfigs.$inferSelect) {
  return {
    provider: row.provider,
    apiKeyConfigured: true,
    config: row.config,
    updated_at: row.updated_at.toISOString()
  };
}

async function getPaymentProvider(req: SelectedPropertyRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      // No property selected → no provider to show.
      return res.status(200).json(null);
    }

    const row = await db.query.paymentProviderConfigs.findFirst({
      where: eq(paymentProviderConfigs.property_id, propertyId)
    });

    res.status(200).json(row ? transformConfig(row) : null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payment provider' });
  }
}

async function savePaymentProvider(
  req: SelectedPropertyRequest,
  res: Response
) {
  try {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;

    // Body is validated + trimmed by validateBody(savePaymentProviderSchema).
    const { provider, apiKey, config } = req.body as SavedPaymentProviderData;
    const values = { provider, config, updated_at: new Date() };

    // Without a new key only a provider that already has one can be saved, and
    // the stored key is only kept for the provider it belongs to.
    if (!apiKey) {
      const [updated] = await db
        .update(paymentProviderConfigs)
        .set(values)
        .where(
          and(
            eq(paymentProviderConfigs.property_id, propertyId),
            eq(paymentProviderConfigs.provider, provider)
          )
        )
        .returning();

      if (!updated) {
        return res.status(400).json({
          error: 'Validation failed',
          details: [{ field: 'apiKey', message: 'API key is required' }]
        });
      }
      return res.status(200).json(transformConfig(updated));
    }

    const withKey = { ...values, api_key_encrypted: encryptSecret(apiKey) };
    const [row] = await db
      .insert(paymentProviderConfigs)
      .values({ property_id: propertyId, ...withKey })
      .onConflictDoUpdate({
        target: paymentProviderConfigs.property_id,
        set: withKey
      })
      .returning();

    if (!row) {
      return res.status(500).json({ error: 'Failed to save payment provider' });
    }

    res.status(200).json(transformConfig(row));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save payment provider' });
  }
}

export { getPaymentProvider, savePaymentProvider };
