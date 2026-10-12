import { and, eq } from 'drizzle-orm';
import type { Response } from 'express';

import type {
  ConfigurableKind,
  SaveProviderData
} from '../../../shared/types/providers';
import { db } from '../db/pool';
import { providerConfigs, users } from '../db/schema';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';
import { encryptSecret } from '../utils/secret-box';

// The route only lets a configurable kind through (see routes/providers.ts).
const kindOf = (req: SelectedPropertyRequest) =>
  req.params.kind as ConfigurableKind;

const ofProperty = (propertyId: string, kind: ConfigurableKind) =>
  and(
    eq(providerConfigs.property_id, propertyId),
    eq(providerConfigs.kind, kind)
  );

// The property's provider of that kind as the API returns it, or null. The
// secret never leaves the server: the client only learns that one is set.
async function findProvider(propertyId: string, kind: ConfigurableKind) {
  const [row] = await db
    .select({
      provider: providerConfigs.provider,
      config: providerConfigs.config,
      updated_at: providerConfigs.updated_at,
      updated_by: {
        id: users.id,
        first_name: users.first_name,
        last_name: users.last_name,
        email: users.email
      }
    })
    .from(providerConfigs)
    .leftJoin(users, eq(users.id, providerConfigs.updated_by))
    .where(ofProperty(propertyId, kind));

  if (!row) return null;

  return {
    provider: row.provider,
    secretConfigured: true,
    config: row.config,
    updated_at: row.updated_at.toISOString(),
    updated_by: row.updated_by
  };
}

async function getProvider(req: SelectedPropertyRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    // No property selected → no provider to show.
    res
      .status(200)
      .json(propertyId ? await findProvider(propertyId, kindOf(req)) : null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
}

async function saveProvider(req: SelectedPropertyRequest, res: Response) {
  try {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;

    const kind = kindOf(req);
    // Body is validated + trimmed by validateBody(saveProviderSchemas[kind]).
    const { provider, secret, config } = req.body as SaveProviderData;
    const values = {
      provider,
      config,
      updated_at: new Date(),
      updated_by: Number(req.user?.id)
    };

    if (secret) {
      // Sets the provider up, or replaces whichever one was there before.
      const withSecret = { ...values, secret_encrypted: encryptSecret(secret) };
      await db
        .insert(providerConfigs)
        .values({ property_id: propertyId, kind, ...withSecret })
        .onConflictDoUpdate({
          target: [providerConfigs.property_id, providerConfigs.kind],
          set: withSecret
        });
    } else {
      // Without a new secret only a provider that already has one can be
      // saved: the stored secret is kept, and it belongs to that provider.
      const updated = await db
        .update(providerConfigs)
        .set(values)
        .where(
          and(
            ofProperty(propertyId, kind),
            eq(providerConfigs.provider, provider)
          )
        )
        .returning({ provider: providerConfigs.provider });

      if (updated.length === 0) {
        return res.status(400).json({
          error: 'Validation failed',
          details: [{ field: 'secret', message: 'Secret is required' }]
        });
      }
    }

    res.status(200).json(await findProvider(propertyId, kind));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save provider' });
  }
}

export { getProvider, saveProvider };
