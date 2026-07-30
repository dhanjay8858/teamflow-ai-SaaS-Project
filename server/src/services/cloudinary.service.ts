import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { UploadApiResponse } from 'cloudinary';
import { AppError } from '../utils/appError.js';

/** Allowed MIME types for file uploads */
export const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'text/markdown',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
]);

/** Maximum file size: 50MB */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

interface UploadResult {
  publicId: string;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  originalFilename: string;
  bytes: number;
  format: string;
}

export function validateMimeType(mimeType: string): void {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw AppError.badRequest(`File type "${mimeType}" is not allowed`);
  }
}

export function validateFileSize(sizeBytes: number): void {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw AppError.badRequest(`File size exceeds the maximum limit of 50MB`);
  }
}

export function getFileExtension(originalName: string): string {
  const parts = originalName.split('.');
  return parts.length > 1 ? (parts.pop() || '').toLowerCase() : '';
}

/**
 * Upload a file buffer to Cloudinary with organized folder structure.
 * Generates thumbnails for images and videos automatically.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string,
  folder: string,
  originalName: string
): Promise<UploadResult> {
  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');

  const resourceType: 'image' | 'video' | 'raw' = isImage
    ? 'image'
    : isVideo
    ? 'video'
    : 'raw';

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `teamflow-ai/${folder}`,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        // Eager transformations for thumbnails on images
        ...(isImage && {
          eager: [{ width: 400, height: 400, crop: 'limit', format: 'webp' }],
          eager_async: true,
        }),
        ...(isVideo && {
          eager: [{ width: 400, height: 225, crop: 'limit', format: 'jpg' }],
          eager_async: true,
        }),
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary upload'));
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });

  const thumbnailUrl =
    (result.eager && result.eager[0]?.secure_url) ||
    (isImage ? cloudinary.url(result.public_id, { width: 400, height: 400, crop: 'limit', format: 'webp' }) : null);

  return {
    publicId: result.public_id,
    url: result.secure_url,
    thumbnailUrl: thumbnailUrl || null,
    width: result.width ?? null,
    height: result.height ?? null,
    duration: result.duration ?? null,
    originalFilename: result.original_filename || originalName,
    bytes: result.bytes,
    format: result.format,
  };
}

/**
 * Permanently delete a file from Cloudinary by publicId.
 */
export async function deleteFromCloudinary(publicId: string, mimeType: string): Promise<void> {
  const resourceType: 'image' | 'video' | 'raw' = mimeType.startsWith('image/')
    ? 'image'
    : mimeType.startsWith('video/')
    ? 'video'
    : 'raw';

  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
