import { useEffect, useMemo, useRef, useState } from 'react';
import { convertImageFile } from '../lib/imageConverter';
import { downloadBlob } from '../lib/download';
import { validateImageFile } from '../lib/fileValidation';
import type { OutputImageFormat, UploadedImage } from '../types/imageTypes';
import { FileList } from './FileList';
import { OutputSettings } from './OutputSettings';
import { UploadDropzone } from './UploadDropzone';

const createId = () => crypto.randomUUID();


export const ImageConverterApp = () => {
  const [files, setFiles] = useState<UploadedImage[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputImageFormat>('jpg');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const previewsRef = useRef<string[]>([]);

  useEffect(() => {
    previewsRef.current = files.map((file) => file.previewUrl);
  }, [files]);

  useEffect(() => () => {
    previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const hasFiles = files.length > 0;

  const addFiles = (incomingFiles: File[]) => {
    const nextFiles: UploadedImage[] = [];
    const invalidMessages: string[] = [];

    incomingFiles.forEach((file) => {
      const validation = validateImageFile(file);

      if (!validation.valid) {
        invalidMessages.push(`${file.name}: ${validation.message}`);
        return;
      }

      nextFiles.push({
        id: createId(),
        file,
        name: file.name,
        mimeType: validation.mimeType,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        status: 'klar',
      });
    });

    if (invalidMessages.length > 0) {
      setErrorMessage(invalidMessages.join(' '));
    } else {
      setErrorMessage(null);
    }

    if (nextFiles.length > 0) {
      setFiles((prev) => [...prev, ...nextFiles]);
    }
  };

  const setStatusForAll = (status: UploadedImage['status']) => {
    setFiles((prev) => prev.map((item) => ({ ...item, status, errorMessage: undefined })));
  };

  const convertAll = async () => {
    if (!hasFiles) {
      setErrorMessage('Legg til minst én fil før konvertering.');
      return;
    }

    setErrorMessage(null);
    setIsConverting(true);
    setStatusForAll('konverterer');

    const failures: string[] = [];

    for (const item of files) {
      try {
        const result = await convertImageFile(item.file, outputFormat);
        downloadBlob(result.blob, result.filename);
        setFiles((prev) =>
          prev.map((file) =>
            file.id === item.id
              ? { ...file, status: 'ferdig', errorMessage: undefined }
              : file,
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Ukjent feil ved konvertering av fil.';

        failures.push(`${item.name}: ${message}`);
        setFiles((prev) =>
          prev.map((file) =>
            file.id === item.id ? { ...file, status: 'feil', errorMessage: message } : file,
          ),
        );
      }
    }

    if (failures.length > 0) {
      setErrorMessage(failures.join(' '));
    }

    setIsConverting(false);
  };

  const fileCountLabel = useMemo(() => {
    if (files.length === 0) {
      return 'Ingen filer valgt';
    }

    if (files.length === 1) {
      return '1 fil valgt';
    }

    return `${files.length} filer valgt`;
  }, [files.length]);

  return (
    <main className="app-shell">
      <header className="hero panel">
        <h1>Image Converter</h1>
        <p>
          Konverter bilder direkte i nettleseren. Alt skjer lokalt på din enhet,
          uten opplasting til server.
        </p>
        <p className="hint">{fileCountLabel}</p>
      </header>

      <UploadDropzone onFilesSelected={addFiles} disabled={isConverting} />

      <OutputSettings
        value={outputFormat}
        onChange={setOutputFormat}
        onConvertAll={convertAll}
        disabled={!hasFiles}
        isConverting={isConverting}
      />

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

      <FileList files={files} />
    </main>
  );
};
