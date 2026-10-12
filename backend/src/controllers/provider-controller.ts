import { and, eq, isNotNull } from 'drizzle-orm';
import type { Response } from 'express';

import {
  type ProviderKind,
  providerSchemas,
  requiresSecret,
  type SaveProviderData
} from '../../../shared/types/providers';
import { db } from '../db/pool';
import { providerConfigs } from '../db/schema';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';
import { encryptSecret } from '../utils/secret-box';

// The route only lets a known kind through (see routes/providers.ts).
const kindOf = (req: SelectedPropertyRequest) =>
  req.params.kind as ProviderKind;

const ofProperty = (propertyId: string, kind: ProviderKind) =>
  and(
    eq(providerConfigs.property_id, propertyId),
    eq(providerConfigs.kind, kind)
  );

// The property's provider of that kind as the API returns it, or null. The
// secret never leaves the server: the client only learns whether one is set.
async function findProvider(propertyId: string, kind: ProviderKind) {
  const row = await db.query.providerConfigs.findFirst({
    where: ofProperty(propertyId, kind)
  });

  if (!row) return null;

  // Checked on the way out too: `config` is free-form JSON to the database, and
  // this is where a field added to a schema since gets its default.
  return providerSchemas[kind].parse({
    provider: row.provider,
    secretConfigured: row.secret_encrypted !== null,
    config: row.config,
    updated_at: row.updated_at.toISOString()
  });
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
    const values = { provider, config, updated_at: new Date() };
    const needsSecret = requiresSecret(provider, config);

    if (!secret) {
      // An empty secret keeps the stored one, which belongs to this provider:
      // so this only updates the provider that is already there, and only
      // while it has the secret it needs.
      const updated = await db
        .update(providerConfigs)
        .set(values)
        .where(
          and(
            ofProperty(propertyId, kind),
            eq(providerConfigs.provider, provider),
            needsSecret
              ? isNotNull(providerConfigs.secret_encrypted)
              : undefined
          )
        )
        .returning({ provider: providerConfigs.provider });

      if (updated.length === 0 && needsSecret) {
        return res.status(400).json({
          error: 'Validation failed',
          details: [{ field: 'secret', message: 'Secret is required' }]
        });
      }
      if (updated.length > 0) {
        return res.status(200).json(await findProvider(propertyId, kind));
      }
    }

    // Sets the provider up, or replaces whichever one was there before:
    // nothing of the previous one is kept, its secret included.
    const row = {
      ...values,
      secret_encrypted: secret ? encryptSecret(secret) : null
    };
    await db
      .insert(providerConfigs)
      .values({ property_id: propertyId, kind, ...row })
      .onConflictDoUpdate({
        target: [providerConfigs.property_id, providerConfigs.kind],
        set: row
      });

    res.status(200).json(await findProvider(propertyId, kind));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save provider' });
  }
}

export { getProvider, saveProvider };
