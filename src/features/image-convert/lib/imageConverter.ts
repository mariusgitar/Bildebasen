import type {
  ConversionResult,
  EncodeSettings,
  OutputImageFormat,
  ResizeSettings,
} from '../types/imageTypes';

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

const getTargetSize = (
  image: HTMLImageElement,
  resizeSettings: ResizeSettings,
): { width: number; height: number } => {
  if (resizeSettings.mode !== 'width' || !resizeSettings.width) {
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }

  const width = Math.max(1, Math.round(resizeSettings.width));

  if (width >= image.naturalWidth) {
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }

  const ratio = image.naturalHeight / image.naturalWidth;

  return {
    width,
    height: Math.max(1, Math.round(width * ratio)),
  };
};

const getEncodeQuality = (
  outputFormat: OutputImageFormat,
  encodeSettings: EncodeSettings,
): number | undefined => {
  if (outputFormat === 'png') {
    return undefined;
  }

  if (typeof encodeSettings.quality === 'number') {
    return encodeSettings.quality;
  }

  return outputFormat === 'jpg' ? 0.92 : 0.9;
};

export const convertImageFile = async (
  file: File,
  outputFormat: OutputImageFormat,
  options?: {
    resizeSettings?: ResizeSettings;
    encodeSettings?: EncodeSettings;
  },
): Promise<ConversionResult> => {
  const image = await decodeImage(file);
  const targetSize = getTargetSize(image, options?.resizeSettings ?? { mode: 'none' });
  const canvas = document.createElement('canvas');
  canvas.width = targetSize.width;
  canvas.height = targetSize.height;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Nettleseren støtter ikke canvas-kontekst.');
  }

  ctx.drawImage(image, 0, 0, targetSize.width, targetSize.height);

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
      getEncodeQuality(outputFormat, options?.encodeSettings ?? {}),
    );
  });

  return {
    blob,
    filename: buildFileName(file.name, outputFormat),
  };
};
