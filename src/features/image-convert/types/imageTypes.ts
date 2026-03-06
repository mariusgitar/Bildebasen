export type InputImageMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/heic'
  | 'image/heif';
export type OutputImageFormat = 'jpg' | 'png' | 'webp';
export type ResizeMode = 'none' | 'width';

export type FileStatus = 'klar' | 'konverterer' | 'ferdig' | 'feil';

export interface UploadedImage {
  id: string;
  file: File;
  sourceFile: File;
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

export interface ResizeSettings {
  mode: ResizeMode;
  width?: number;
}

export interface EncodeSettings {
  quality?: number;
}
