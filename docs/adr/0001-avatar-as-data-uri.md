# Avatars are stored as data URIs in a text column

Profile avatars are stored as a base64 `data:image/webp` string in `users.avatar_url`, not as objects in a blob store. The backend has no file-upload path at all (no multer, no S3, no Vercel Blob), and adding one for a single 96×96 image would mean a new dependency, new credentials and a new failure mode. Instead the browser crops and re-encodes the image to 256×256 WebP (~15 KB) before it is sent, so the payload rides along in the ordinary JSON `PATCH` that already exists.

## Consequences

- `avatar_url` is **excluded from the `/users` list response**. Twenty rows × ~20 KB of base64 would otherwise be added to a request that only needs initials. It is returned by `/users/me` and `/users/:id` only.
- The column is capped in Zod (~200 KB) so a hand-crafted request cannot store an arbitrarily large blob.
- Avatars are not CDN-cacheable and not addressable by URL. If either becomes a requirement — or if avatars grow beyond a small square thumbnail — this needs a real object store, and moving the existing rows out is a data migration, not a config change.
