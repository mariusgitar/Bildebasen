import type { ConversionResult, OutputImageFormat } from '../types/imageTypes';

const OUTPUT_TO_MIME: Record<OutputImageFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const decodeImage = async (file: File): Promise<HTMLImageElement> => {
  const previewUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = previewUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Kunne ikke lese bildet.'));
    });

    return image;
  } finally {
    URL.revokeObjectURL(previewUrl);
  }
};

const buildFileName = (originalName: string, outputFormat: OutputImageFormat): string => {
  const nameWithoutExt = originalName.replace(/\.[^.]+$/, '');
  const extension = outputFormat === 'jpg' ? 'jpg' : outputFormat;

  return `${nameWithoutExt}.${extension}`;
};

export const convertImageFile = async (
  file: File,
  outputFormat: OutputImageFormat,
): Promise<ConversionResult> => {
  const image = await decodeImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Nettleseren støtter ikke canvas-kontekst.');
  }

  ctx.drawImage(image, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error('Kunne ikke konvertere bildet.'));
          return;
        }

        resolve(result);
      },
      OUTPUT_TO_MIME[outputFormat],
      outputFormat === 'jpg' ? 0.92 : undefined,
    );
  });

  return {
    blob,
    filename: buildFileName(file.name, outputFormat),
  };
};
