/**
 * Utility functions for image resizing, modern WebP compression, and caching.
 * Compresses images before upload to dramatically reduce transfer size and loading latency.
 */

// Check if browser supports WebP canvas export
let _supportsWebP: boolean | null = null;
export const isWebPSupported = (): boolean => {
  if (_supportsWebP !== null) return _supportsWebP;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    _supportsWebP = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    _supportsWebP = false;
  }
  return _supportsWebP;
};

export interface CompressImageOptions {
  maxDimension?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeMB?: number;
  quality?: number;
  preferWebP?: boolean;
}

export interface CompressResult {
  dataUrl: string;
  blob: Blob;
  contentType: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Compresses an image file to a lightweight WebP/JPEG blob and dataUrl.
 * Typically reduces a 3-10MB mobile/camera photo down to 20-80KB with negligible visual loss.
 */
export const compressImageFile = (
  file: File | Blob,
  options: CompressImageOptions = {}
): Promise<CompressResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        const maxDim = options.maxDimension || 512;
        const maxWidth = options.maxWidth || maxDim;
        const maxHeight = options.maxHeight || maxDim;
        const maxSizeMB = options.maxSizeMB || 0.15; // default max 150KB
        const preferWebP = options.preferWebP !== false && isWebPSupported();
        const mimeType = preferWebP ? 'image/webp' : 'image/jpeg';

        // Scale proportionally
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: mimeType === 'image/webp' });
        if (!ctx) {
          reject(new Error('Cannot create canvas context for image compression'));
          return;
        }

        // Draw scaled image with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let quality = options.quality ?? 0.82;
        let dataUrl = canvas.toDataURL(mimeType, quality);

        // Adjust quality iteratively if size still exceeds target limit
        const maxBytes = maxSizeMB * 1024 * 1024;
        while (dataUrl.length * 0.75 > maxBytes && quality > 0.3) {
          quality -= 0.12;
          dataUrl = canvas.toDataURL(mimeType, quality);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to generate image blob'));
              return;
            }
            resolve({
              dataUrl,
              blob,
              contentType: mimeType,
              width,
              height,
              sizeBytes: blob.size,
            });
          },
          mimeType,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Backwards-compatible resize function returning a dataUrl string.
 */
export const resizeImageFile = async (
  file: File,
  maxSizeMB = 0.2,
  maxWidth = 400,
  maxHeight = 400
): Promise<string> => {
  const result = await compressImageFile(file, {
    maxSizeMB,
    maxWidth,
    maxHeight,
    preferWebP: true,
    quality: 0.82,
  });
  return result.dataUrl;
};

