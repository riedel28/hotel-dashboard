import { eq } from 'drizzle-orm';
import request from 'supertest';

import type { CmsNode } from '../../shared/types/cms';
import app from '../src/app';
import { db } from '../src/db/pool';
import { cmsImages, users } from '../src/db/schema';
import { createTestProperty, createTestUser } from './helpers/db-helpers';

// The smallest valid PNG: enough for the upload, which checks the extension.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

describe('Mobile CMS API', () => {
  let auth: string;
  let otherAuth: string;

  beforeEach(async () => {
    const property = await createTestProperty({ name: 'Hotel A' });
    const otherProperty = await createTestProperty({ name: 'Hotel B' });
    const { user, token } = await createTestUser();
    const { user: other, token: otherToken } = await createTestUser();
    await db
      .update(users)
      .set({ selected_property_id: property.id })
      .where(eq(users.id, user.id));
    await db
      .update(users)
      .set({ selected_property_id: otherProperty.id })
      .where(eq(users.id, other.id));
    auth = `Bearer ${token}`;
    otherAuth = `Bearer ${otherToken}`;
  });

  async function create(
    title: string,
    parent_id: number | null = null,
    type: 'page' | 'link' = 'page'
  ) {
    const res = await request(app)
      .post('/api/cms/nodes')
      .set('Authorization', auth)
      .send({
        parent_id,
        type,
        title,
        ...(type === 'link' && { url: 'https://example.com' })
      });
    expect(res.status).toBe(201);
    return res.body as CmsNode;
  }

  async function list() {
    const res = await request(app)
      .get('/api/cms/nodes')
      .set('Authorization', auth)
      .expect(200);
    return res.body as CmsNode[];
  }

  async function uploadImage() {
    const res = await request(app)
      .post('/api/cms/images')
      .set('Authorization', auth)
      .attach('file', png, 'pixel.png')
      .expect(201);
    return res.body.id as string;
  }

  function saveBody(node: CmsNode, changes: Record<string, unknown> = {}) {
    return {
      type: node.type,
      url: node.url,
      open_mode: node.open_mode,
      image_ids: node.image_ids,
      translations: { de: node.translations.de },
      updated_at: node.updated_at,
      ...changes
    };
  }

  function save(node: CmsNode, changes: Record<string, unknown> = {}) {
    return request(app)
      .put(`/api/cms/nodes/${node.id}`)
      .set('Authorization', auth)
      .send(saveBody(node, changes));
  }

  function move(id: number, parent_id: number | null, index: number) {
    return request(app)
      .post(`/api/cms/nodes/${id}/move`)
      .set('Authorization', auth)
      .send({ parent_id, index });
  }

  it("keeps each property's content to itself", async () => {
    const node = await create('Willkommen');

    const res = await request(app)
      .get('/api/cms/nodes')
      .set('Authorization', otherAuth)
      .expect(200);
    expect(res.body).toEqual([]);
    await request(app)
      .delete(`/api/cms/nodes/${node.id}`)
      .set('Authorization', otherAuth)
      .expect(404);
    await request(app)
      .post(`/api/cms/nodes/${node.id}/move`)
      .set('Authorization', otherAuth)
      .send({ parent_id: null, index: 0 })
      .expect(404);
  });

  it('creates nodes hidden, at the end of their level', async () => {
    const first = await create('Erste');
    const second = await create('Zweite');

    expect(first).toMatchObject({ hidden: true, position: 0, type: 'page' });
    expect(second.position).toBe(1);
    expect(first.translations.de?.title).toBe('Erste');
  });

  it('refuses a link as a parent', async () => {
    const link = await create('Website', null, 'link');
    await request(app)
      .post('/api/cms/nodes')
      .set('Authorization', auth)
      .send({ parent_id: link.id, type: 'page', title: 'Unter' })
      .expect(400);
  });

  describe('save', () => {
    it('sanitizes the text and drops an empty translation', async () => {
      const node = await create('Spa');
      const res = await save(node, {
        translations: {
          de: {
            title: 'Spa',
            subtitle: 'Entspannen',
            body: '<p onclick="x()">Hallo<script>alert(1)</script></p><img src="https://x/y.png">',
            url: null
          },
          en: { title: '', subtitle: '', body: '<p></p>', url: '' }
        }
      }).expect(200);

      expect(res.body.translations.de.body).toBe('<p>Hallo</p>');
      expect(res.body.translations.en).toBeUndefined();
    });

    it('requires the primary title, a valid link URL and a short subtitle', async () => {
      const node = await create('Spa');
      const de = { title: 'Spa', subtitle: null, body: null, url: null };

      await save(node, { translations: { de: { ...de, title: '' } } }).expect(
        400
      );
      await save(node, {
        translations: { de: { ...de, subtitle: 'x'.repeat(81) } }
      }).expect(400);
      await save(node, {
        type: 'link',
        url: 'ftp://example.com',
        open_mode: 'system'
      }).expect(400);
    });

    it('answers 409 to a form loaded before a newer save', async () => {
      const node = await create('Spa');
      await save(node).expect(200);

      const res = await save(node).expect(409);
      expect(res.body.code).toBe('STALE');
    });

    it('does not turn a page with nested items into a link', async () => {
      const parent = await create('Restaurant');
      await create('Speisekarte', parent.id);
      const [fresh] = (await list()).filter((n) => n.id === parent.id);

      const res = await save(fresh!, {
        type: 'link',
        url: 'https://example.com',
        open_mode: 'in_app'
      }).expect(409);
      expect(res.body.code).toBe('HAS_CHILDREN');
    });

    it('drops text and gallery when a page becomes a link', async () => {
      const node = await create('Spa');
      const image = await uploadImage();
      const page = (
        await save(node, {
          image_ids: [image],
          translations: {
            de: { title: 'Spa', subtitle: null, body: '<p>Text</p>', url: null }
          }
        }).expect(200)
      ).body as CmsNode;

      const link = (
        await save(page, {
          type: 'link',
          url: 'https://spa.example.com',
          open_mode: 'system',
          image_ids: [],
          translations: {
            de: {
              title: 'Spa',
              subtitle: null,
              body: '<p>Text</p>',
              url: null
            },
            en: {
              title: null,
              subtitle: null,
              body: null,
              url: 'https://spa.example.com/en'
            }
          }
        }).expect(200)
      ).body as CmsNode;

      expect(link).toMatchObject({
        type: 'link',
        url: 'https://spa.example.com',
        image_ids: []
      });
      expect(link.translations.de?.body).toBeNull();
      expect(link.translations.en?.url).toBe('https://spa.example.com/en');
    });

    it("rejects another property's image", async () => {
      const image = await uploadImage();
      const res = await request(app)
        .post('/api/cms/nodes')
        .set('Authorization', otherAuth)
        .send({ parent_id: null, type: 'page', title: 'Fremd' })
        .expect(201);

      await request(app)
        .put(`/api/cms/nodes/${res.body.id}`)
        .set('Authorization', otherAuth)
        .send(saveBody(res.body, { image_ids: [image] }))
        .expect(400);
    });
  });

  describe('move', () => {
    it('reorders within a level and moves between levels', async () => {
      const a = await create('A');
      const b = await create('B');
      const c = await create('C');

      await move(c.id, null, 0).expect(200);
      let nodes = await list();
      const order = () =>
        nodes
          .filter((n) => n.parent_id === null)
          .sort((x, y) => x.position - y.position)
          .map((n) => n.id);
      expect(order()).toEqual([c.id, a.id, b.id]);

      await move(b.id, a.id, 0).expect(200);
      nodes = await list();
      expect(nodes.find((n) => n.id === b.id)?.parent_id).toBe(a.id);
      expect(order()).toEqual([c.id, a.id]);
    });

    it('refuses to move a node into itself, its descendants or a link', async () => {
      const a = await create('A');
      const child = await create('Child', a.id);
      const link = await create('Link', null, 'link');

      await move(a.id, a.id, 0).expect(400);
      await move(a.id, child.id, 0).expect(400);
      await move(child.id, link.id, 0).expect(400);
    });

    it('keeps an open form saveable', async () => {
      const a = await create('A');
      await create('B');
      await move(a.id, null, 1).expect(200);

      await save(a).expect(200);
    });
  });

  it('hides and shows a node without touching its descendants', async () => {
    const parent = await create('Parent');
    const child = await create('Child', parent.id);
    await request(app)
      .patch(`/api/cms/nodes/${child.id}/visibility`)
      .set('Authorization', auth)
      .send({ hidden: false })
      .expect(200);

    await request(app)
      .patch(`/api/cms/nodes/${parent.id}/visibility`)
      .set('Authorization', auth)
      .send({ hidden: false })
      .expect(200);

    const nodes = await list();
    expect(nodes.find((n) => n.id === child.id)?.hidden).toBe(false);
    expect(nodes.find((n) => n.id === parent.id)?.hidden).toBe(false);
  });

  it('duplicates a branch right after the original, hidden', async () => {
    const first = await create('Restaurant');
    const menu = await create('Speisekarte', first.id);
    await create('Allergene', menu.id);
    // A child that is shown (create starts hidden) and has an image.
    const image = await uploadImage();
    await save(menu, { image_ids: [image] }).expect(200);
    await request(app)
      .patch(`/api/cms/nodes/${menu.id}/visibility`)
      .set('Authorization', auth)
      .send({ hidden: false })
      .expect(200);
    const last = await create('Bar');

    const res = await request(app)
      .post(`/api/cms/nodes/${first.id}/duplicate`)
      .set('Authorization', auth)
      .expect(201);
    const copy = res.body as CmsNode;

    expect(copy).toMatchObject({ hidden: true, position: 1, parent_id: null });
    expect(copy.translations.de?.title).toBe('Restaurant (Kopie)');
    const nodes = await list();
    expect(nodes.find((n) => n.id === last.id)?.position).toBe(2);
    const copiedChildren = nodes.filter((n) => n.parent_id === copy.id);
    expect(copiedChildren).toMatchObject([
      { translations: { de: { title: 'Speisekarte' } }, hidden: false }
    ]);
    expect(copiedChildren[0]?.image_ids).toEqual([image]);
    const grandchildren = nodes.filter(
      (n) => n.parent_id === copiedChildren[0]?.id
    );
    expect(grandchildren.map((n) => n.translations.de?.title)).toEqual([
      'Allergene'
    ]);
    // The copy's ids came from the sequence: later nodes don't collide.
    await create('Spa');
  });

  it('deletes a node with its whole branch', async () => {
    const parent = await create('Parent');
    const child = await create('Child', parent.id);
    await create('Grandchild', child.id);
    const other = await create('Other');

    await request(app)
      .delete(`/api/cms/nodes/${parent.id}`)
      .set('Authorization', auth)
      .expect(200);

    expect((await list()).map((n) => n.id)).toEqual([other.id]);
  });

  describe('images', () => {
    it('serves an uploaded image without authentication', async () => {
      const id = await uploadImage();

      const res = await request(app).get(`/api/cms/images/${id}`).expect(200);
      expect(res.headers['content-type']).toBe('image/png');
      expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
    });

    it('refuses other file types', async () => {
      await request(app)
        .post('/api/cms/images')
        .set('Authorization', auth)
        .attach('file', Buffer.from('<svg/>'), 'x.svg')
        .expect(400);
    });

    it('sweeps day-old images nothing refers to', async () => {
      const kept = await uploadImage();
      const orphan = await uploadImage();
      const fresh = await uploadImage();
      const node = await create('Spa');
      await save(node, { image_ids: [kept] }).expect(200);
      const dayAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      for (const id of [kept, orphan]) {
        await db
          .update(cmsImages)
          .set({ created_at: dayAgo })
          .where(eq(cmsImages.id, id));
      }

      await request(app)
        .delete(`/api/cms/nodes/${(await create('Tmp')).id}`)
        .set('Authorization', auth)
        .expect(200);

      const left = (await db.select({ id: cmsImages.id }).from(cmsImages)).map(
        (row) => row.id
      );
      expect(left.sort()).toEqual([kept, fresh].sort());
    });
  });
});
