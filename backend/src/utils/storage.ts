/**
 * Where uploaded files live. Postgres holds only their metadata.
 *
 * Screenshots a student sends for verification have to stay legible, so they
 * cannot be squeezed down like avatars (which live in `users.avatar_data`).
 * At a few hundred KB each they would fill Neon's free tier within weeks, and
 * Vercel has no persistent disk — so production writes to an S3-compatible
 * bucket (Cloudflare R2: 10 GB free, no egress fees).
 *
 * Drivers, picked once from the environment:
 *   - memory  under test, so the suite never touches a disk or the network
 *   - s3      S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY set
 *   - none    on Vercel without a bucket — uploads are refused with 503, and
 *             link-only requests keep working
 *   - local   anywhere else (Docker dev, a VPS): UPLOAD_DIR, default ./uploads
 *
 * The bucket must be private. Files are only ever served through
 * `GET /verification-requests/:id/attachments/:attachmentId`, which checks
 * that the viewer is the student who sent it or an admin.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { AwsClient } from 'aws4fetch';

export interface Storage {
  readonly driver: 's3' | 'local' | 'memory';
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Null when the object does not exist. */
  get(key: string): Promise<Buffer | null>;
  /** Deleting something already gone is not an error. */
  delete(key: string): Promise<void>;
}

/** Keys are generated server-side; this is a guard, not an input filter. */
const SAFE_KEY = /^[a-z0-9][a-z0-9/_.-]*$/;
const assertKey = (key: string) => {
  if (!SAFE_KEY.test(key) || key.includes('..')) throw new Error(`Unsafe storage key: ${key}`);
};

const s3Storage = (): Storage => {
  const endpoint = process.env.S3_ENDPOINT!.replace(/\/+$/, '');
  const bucket = process.env.S3_BUCKET!;
  const client = new AwsClient({
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    service: 's3',
    // R2 accepts "auto"; AWS needs the bucket's real region.
    region: process.env.S3_REGION || 'auto'
  });

  // Path-style addressing works on R2, MinIO and AWS alike.
  const urlFor = (key: string) => `${endpoint}/${bucket}/${key}`;

  return {
    driver: 's3',
    put: async (key, body, contentType) => {
      assertKey(key);
      const res = await client.fetch(urlFor(key), {
        method: 'PUT',
        body: new Uint8Array(body),
        headers: { 'Content-Type': contentType },
        signal: AbortSignal.timeout(15_000)
      });
      if (!res.ok) throw new Error(`Storage PUT ${res.status}: ${await res.text().catch(() => '')}`);
    },
    get: async key => {
      assertKey(key);
      const res = await client.fetch(urlFor(key), { signal: AbortSignal.timeout(15_000) });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Storage GET ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    },
    delete: async key => {
      assertKey(key);
      const res = await client.fetch(urlFor(key), {
        method: 'DELETE',
        signal: AbortSignal.timeout(15_000)
      });
      if (!res.ok && res.status !== 404) throw new Error(`Storage DELETE ${res.status}`);
    }
  };
};

const diskStorage = (): Storage => {
  const root = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
  const fileFor = (key: string) => {
    assertKey(key);
    return path.join(root, ...key.split('/'));
  };

  return {
    driver: 'local',
    put: async (key, body) => {
      const file = fileFor(key);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, body);
    },
    get: async key => {
      try {
        return await fs.readFile(fileFor(key));
      } catch (err: any) {
        if (err?.code === 'ENOENT') return null;
        throw err;
      }
    },
    delete: async key => {
      await fs.rm(fileFor(key), { force: true });
    }
  };
};

const memoryStorage = (): Storage => {
  const objects = new Map<string, Buffer>();
  return {
    driver: 'memory',
    put: async (key, body) => {
      assertKey(key);
      objects.set(key, Buffer.from(body));
    },
    get: async key => objects.get(key) ?? null,
    delete: async key => {
      objects.delete(key);
    }
  };
};

const isS3Configured = () =>
  Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );

let instance: Storage | null | undefined;

/** The configured store, or null when uploads are unavailable here. */
export const getStorage = (): Storage | null => {
  if (instance !== undefined) return instance;

  // Test first, so a developer's real bucket credentials never receive test uploads.
  if (process.env.NODE_ENV === 'test') instance = memoryStorage();
  else if (isS3Configured()) instance = s3Storage();
  else if (process.env.VERCEL) {
    console.warn('File uploads are disabled: set S3_* variables to enable them on Vercel.');
    instance = null;
  } else instance = diskStorage();

  return instance;
};

/** Tests only: swap the store, e.g. to simulate uploads being unavailable. */
export const setStorageForTests = (storage: Storage | null | undefined): void => {
  instance = storage;
};
