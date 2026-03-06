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

const loadImageFromFile = async (file: File): Promise<HTMLImageElement> => {
  const previewUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = previewUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Kunne ikke dekode filen.'));
    });

    return image;
  } finally {
    URL.revokeObjectURL(previewUrl);
  }
};

const canvasToPngBlob = async (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Kunne ikke lage mellomformat for HEIC/HEIF.'));
        return;
      }

      resolve(blob);
    }, 'image/png');
  });

export const decodeHeicToBrowserImage = async (file: File): Promise<File> => {
  if (!isHeicFile(file)) {
    return file;
  }

  try {
    const image = await loadImageFromFile(file);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Nettleseren støtter ikke canvas-kontekst.');
    }

    ctx.drawImage(image, 0, 0);

    const blob = await canvasToPngBlob(canvas);
    const outputName = file.name.replace(/\.[^.]+$/, '.png');

    return new File([blob], outputName, { type: 'image/png' });
  } catch {
    throw new Error('Kunne ikke lese HEIC/HEIF-filen. Filen eller nettleserstøtten kan være begrenset.');
  }
};
