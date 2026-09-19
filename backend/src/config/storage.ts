import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

const isS3Configured = Boolean(
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET_NAME
);

export const s3Client = isS3Configured
  ? new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    })
  : null;

export interface UploadResult {
  url: string;
  filename: string;
  storage: 's3' | 'local';
}

/**
 * Uploads a buffer directly to S3-compatible Cloud Storage (Cloudflare R2 / UpCloud Object Storage)
 * or falls back seamlessly to local server disk storage if S3 credentials are not set.
 */
export async function uploadMediaFile(
  buffer: Buffer,
  filename: string,
  mimetype: string,
  reqBaseUrl: string
): Promise<UploadResult> {
  if (s3Client && process.env.S3_BUCKET_NAME) {
    const key = `campaigns/${filename}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    let publicUrl: string;
    if (process.env.S3_PUBLIC_URL) {
      const publicBase = process.env.S3_PUBLIC_URL.replace(/\/+$/, '');
      publicUrl = `${publicBase}/${key}`;
    } else if (process.env.S3_ENDPOINT) {
      const endpoint = process.env.S3_ENDPOINT.replace(/\/+$/, '');
      publicUrl = `${endpoint}/${process.env.S3_BUCKET_NAME}/${key}`;
    } else {
      publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    return {
      url: publicUrl,
      filename,
      storage: 's3',
    };
  }

  // Fallback to local server disk if S3 is not configured
  const uploadsDir = path.join(__dirname, '../../uploads/campaigns');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  const publicUrl = `${reqBaseUrl}/uploads/campaigns/${filename}`;
  return {
    url: publicUrl,
    filename,
    storage: 'local',
  };
}

/**
 * Deletes an uploaded media file from S3 or local server disk when a campaign is deleted.
 * Safely ignores external media links like YouTube, TikTok, or Google Drive.
 */
export async function deleteMediaFile(mediaUrl: string): Promise<void> {
  if (!mediaUrl) return;

  // 1. Delete from S3 if it matches our S3 bucket campaigns key
  if (s3Client && process.env.S3_BUCKET_NAME) {
    const match = mediaUrl.match(/campaigns\/([^/?#]+)/);
    if (match) {
      const key = `campaigns/${match[1]}`;
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
          })
        );
      } catch (err) {
        console.warn(`Could not delete S3 object ${key}:`, err);
      }
    }
  }

  // 2. Delete from local server disk if it's a local /uploads/campaigns/ file
  const localMatch = mediaUrl.match(/\/uploads\/campaigns\/([^/?#]+)/);
  if (localMatch) {
    const filePath = path.join(__dirname, '../../uploads/campaigns', localMatch[1]);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.warn(`Could not delete local file ${filePath}:`, err);
      }
    }
  }
}
