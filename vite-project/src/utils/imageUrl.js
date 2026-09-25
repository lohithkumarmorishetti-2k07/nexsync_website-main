/**
 * Utility to process and normalize image URLs across the application.
 * Converts Google Drive share links to direct embeddable image CDN URLs
 * and provides client-side image compression for local file uploads.
 */

/**
 * Extracts Google Drive file ID from diverse link structures.
 */
export const extractGoogleDriveId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Match /file/d/FILE_ID or /d/FILE_ID
  const fileIdMatch = trimmed.match(/(?:\/file\/d\/|\/d\/)([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return fileIdMatch[1];
  }

  // Match id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1] && (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com') || trimmed.includes('googleusercontent.com'))) {
    return idMatch[1];
  }

  return null;
};

/**
 * Converts Google Drive share links to direct embeddable image CDN URLs.
 */
export const formatImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  if (trimmed.startsWith('data:image/') || trimmed.startsWith('/')) {
    return trimmed;
  }

  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    // Google's direct CDN thumbnail endpoint works reliably for embedded <img> tags
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  // Prepend https:// if user pasted a raw domain like unsplash.com or drive.google.com
  if (!/^https?:\/\//i.test(trimmed) && trimmed.includes('.')) {
    return `https://${trimmed}`;
  }

  return trimmed;
};

/**
 * Fallback URL for Google Drive images if lh3 CDN encounters network quirks.
 */
export const getDriveFallbackUrl = (url) => {
  const driveId = extractGoogleDriveId(url);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  }
  return null;
};

/**
 * Compresses an uploaded image file on the client using HTML5 Canvas.
 * Downscales images exceeding max dimensions and compresses to JPEG,
 * reducing a 3-10MB upload down to ~100-300KB.
 * This prevents HTTP 413 Payload Too Large errors and speeds up loading.
 */
export const compressImageFile = (file, maxWidth = 1200, maxHeight = 900, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Pass SVG through directly via FileReader since SVG is vector code
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized data URL (JPEG for broad compatibility)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        // Fallback to raw base64 if image decoding fails
        resolve(readerEvent.target.result);
      };
      img.src = readerEvent.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
