import type { InputImageMimeType } from '../types/imageTypes';

const SUPPORTED_MIME_TYPES: InputImageMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const normalizeJpg = (name: string): string =>
  name.toLowerCase().endsWith('.jpg') ? name.slice(0, -4) + '.jpeg' : name;

const detectMimeTypeFromName = (file: File): InputImageMimeType | null => {
  const normalizedName = normalizeJpg(file.name).toLowerCase();

  if (normalizedName.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (normalizedName.endsWith('.png')) {
    return 'image/png';
  }

  if (normalizedName.endsWith('.webp')) {
    return 'image/webp';
  }

  return null;
};

export const getSupportedMimeTypes = (): InputImageMimeType[] =>
  [...SUPPORTED_MIME_TYPES];

export const validateImageFile = (
  file: File,
): { valid: true; mimeType: InputImageMimeType } | { valid: false; message: string } => {
  const mimeType = file.type as InputImageMimeType;

  if (SUPPORTED_MIME_TYPES.includes(mimeType)) {
    return { valid: true, mimeType };
  }

  const detectedMimeType = detectMimeTypeFromName(file);

  if (detectedMimeType) {
    return { valid: true, mimeType: detectedMimeType };
  }

  return {
    valid: false,
    message:
      'Ugyldig filtype. Kun JPG/JPEG, PNG og WEBP er støttet i denne versjonen.',
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
