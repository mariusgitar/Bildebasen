import JSZip from 'jszip';
import type { ConversionResult } from '../types/imageTypes';

export const downloadBlob = (blob: Blob, filename: string): void => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  // Give the browser time to start reading the URL before releasing it.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
};

const makeUniqueFilename = (filename: string, usedFilenames: Set<string>): string => {
  const extensionIndex = filename.lastIndexOf('.');
  const basename = extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename;
  const extension = extensionIndex > 0 ? filename.slice(extensionIndex) : '';
  let uniqueFilename = filename;
  let suffix = 2;

  while (usedFilenames.has(uniqueFilename.toLocaleLowerCase())) {
    uniqueFilename = `${basename} (${suffix})${extension}`;
    suffix += 1;
  }

  usedFilenames.add(uniqueFilename.toLocaleLowerCase());
  return uniqueFilename;
};

export const downloadAllIndividually = (results: ConversionResult[]): void => {
  results.forEach(({ blob, filename }) => downloadBlob(blob, filename));
};

export const downloadResultsAsZip = async (
  results: ConversionResult[],
  zipFilename = 'bildebasen-bilder.zip',
): Promise<void> => {
  const zip = new JSZip();
  const usedFilenames = new Set<string>();

  results.forEach(({ blob, filename }) => {
    zip.file(makeUniqueFilename(filename, usedFilenames), blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, zipFilename);
};
