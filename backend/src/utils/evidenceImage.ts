/**
 * Screenshots students attach to a verification request.
 *
 * Every upload is decoded and re-encoded rather than stored as sent:
 *   - sharp failing to decode is the real "is this an image?" test — the
 *     client's Content-Type is only a first filter;
 *   - re-encoding drops EXIF, so a phone photo's GPS position never reaches
 *     the review team or the bucket;
 *   - `limitInputPixels` refuses decompression bombs (tiny file, huge canvas);
 *   - 2000px on the long side keeps small print in a poster readable while
 *     holding each file to a few hundred KB.
 */
import sharp from 'sharp';

export const ALLOWED_EVIDENCE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Per file. The browser downscales first; this is the backstop. */
export const MAX_EVIDENCE_BYTES = 4 * 1024 * 1024;
export const MAX_EVIDENCE_FILES = 3;

const MAX_EDGE = 2000;
const MAX_INPUT_PIXELS = 50_000_000;

export interface ProcessedImage {
  data: Buffer;
  mime: 'image/jpeg';
  width: number;
  height: number;
}

export class InvalidImageError extends Error {}

export const processEvidenceImage = async (input: Buffer): Promise<ProcessedImage> => {
  try {
    const { data, info } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
      // Apply the EXIF orientation before it is stripped, or portrait photos land sideways.
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    return { data, mime: 'image/jpeg', width: info.width, height: info.height };
  } catch {
    throw new InvalidImageError('That file is not an image we can read.');
  }
};
