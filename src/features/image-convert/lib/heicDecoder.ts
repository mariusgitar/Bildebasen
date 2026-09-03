import type { InputImageMimeType } from '../types/imageTypes';

const HEIC_MIME_TYPES: InputImageMimeType[] = ['image/heic', 'image/heif'];

const getFileExtension = (filename: string): string => {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
};

export const isHeicMimeType = (mimeType: string): mimeType is 'image/heic' | 'image/heif' =>
  HEIC_MIME_TYPES.includes(mimeType as InputImageMimeType);

export const isHeicFile = (file: File): boolean => {
  if (isHeicMimeType(file.type)) {
    return true;
  }

  const extension = getFileExtension(file.name);
  return extension === 'heic' || extension === 'heif';
};

export const decodeHeicToBrowserImage = async (file: File): Promise<File> => {
  if (!isHeicFile(file)) {
    return file;
  }

  try {
    const { default: heic2any } = await import('heic2any');
    const converted = await heic2any({
      blob: file,
      toType: 'image/png',
      quality: 1,
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;

    if (!blob) {
      throw new Error('HEIC/HEIF-dekoderen returnerte ikke et bilde.');
    }

    const outputName = file.name.replace(/\.[^.]+$/, '.png');
    return new File([blob], outputName, { type: 'image/png' });
  } catch {
    throw new Error(
      'Kunne ikke lese HEIC/HEIF-filen. Filen kan bruke en variant som ikke støttes.',
    );
  }
};
