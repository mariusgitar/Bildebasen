export type InputImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';
export type OutputImageFormat = 'jpg' | 'png' | 'webp';

export type FileStatus = 'klar' | 'konverterer' | 'ferdig' | 'feil';

export interface UploadedImage {
  id: string;
  file: File;
  name: string;
  mimeType: InputImageMimeType;
  size: number;
  previewUrl: string;
  status: FileStatus;
  errorMessage?: string;
}

export interface ConversionResult {
  blob: Blob;
  filename: string;
}
