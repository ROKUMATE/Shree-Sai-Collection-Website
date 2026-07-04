import path from "path";

// Uploaded product images live outside the build output so they survive
// image rebuilds — in production this is a Docker volume (see docker-compose.yml).
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export function allowedExtension(ext: string) {
  return Object.prototype.hasOwnProperty.call(CONTENT_TYPES, ext);
}

/** Server-generated names only: hex + extension. Blocks path traversal. */
export function isSafeUploadName(name: string) {
  return /^[a-f0-9]{16}\.[a-z0-9]+$/.test(name);
}
