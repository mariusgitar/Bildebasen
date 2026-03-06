import { useEffect, useMemo, useRef, useState } from 'react';
import { convertImageFile } from '../lib/imageConverter';
import { decodeHeicToBrowserImage } from '../lib/heicDecoder';
import { downloadBlob } from '../lib/download';
import { validateImageFile } from '../lib/fileValidation';
import type { OutputImageFormat, ResizeMode, UploadedImage } from '../types/imageTypes';
import { FileList } from './FileList';
import { OutputSettings } from './OutputSettings';
import { UploadDropzone } from './UploadDropzone';

const createId = () => crypto.randomUUID();

const MIN_QUALITY_PERCENT = 60;
const MAX_QUALITY_PERCENT = 100;

const clampQualityPercent = (value: number): number =>
  Math.min(MAX_QUALITY_PERCENT, Math.max(MIN_QUALITY_PERCENT, value));

const parseResizeWidth = (width: string): number | undefined => {
  const parsed = Number(width);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.round(parsed);
};

export const ImageConverterApp = () => {
  const [files, setFiles] = useState<UploadedImage[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputImageFormat>('jpg');
  const [resizeMode, setResizeMode] = useState<ResizeMode>('none');
  const [resizeWidth, setResizeWidth] = useState('');
  const [qualityPercent, setQualityPercent] = useState(92);
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

  const addFiles = async (incomingFiles: File[]) => {
    const nextFiles: UploadedImage[] = [];
    const invalidMessages: string[] = [];

    for (const file of incomingFiles) {
      const validation = validateImageFile(file);

      if (!validation.valid) {
        invalidMessages.push(`${file.name}: ${validation.message}`);
        continue;
      }

      try {
        const sourceFile = await decodeHeicToBrowserImage(file);

        nextFiles.push({
          id: createId(),
          file,
          sourceFile,
          name: file.name,
          mimeType: validation.mimeType,
          size: file.size,
          previewUrl: URL.createObjectURL(sourceFile),
          status: 'klar',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kunne ikke lese filen.';
        invalidMessages.push(`${file.name}: ${message}`);
      }
    }

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

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const targetFile = prev.find((item) => item.id === id);

      if (targetFile) {
        URL.revokeObjectURL(targetFile.previewUrl);
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  const convertAll = async () => {
    if (!hasFiles) {
      setErrorMessage('Legg til minst én fil før konvertering.');
      return;
    }

    const parsedWidth = parseResizeWidth(resizeWidth);

    if (resizeMode === 'width' && !parsedWidth) {
      setErrorMessage('Angi en gyldig bredde større enn 0 for resize.');
      return;
    }

    setErrorMessage(null);
    setIsConverting(true);
    setStatusForAll('konverterer');

    const failures: string[] = [];

    for (const item of files) {
      try {
        const result = await convertImageFile(item.sourceFile, outputFormat, {
          resizeSettings:
            resizeMode === 'width' && parsedWidth
              ? {
                  mode: 'width',
                  width: parsedWidth,
                }
              : {
                  mode: 'none',
                },
          encodeSettings:
            outputFormat === 'png'
              ? {}
              : {
                  quality: qualityPercent / 100,
                },
        });

        downloadBlob(result.blob, result.filename);
        setFiles((prev) =>
          prev.map((file) =>
            file.id === item.id
              ? { ...file, status: 'ferdig', errorMessage: undefined }
              : file,
          ),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ukjent feil ved konvertering av fil.';

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
        <h1>Bildebasen</h1>
        <p>
          Konverter bilder direkte i nettleseren. Alt skjer lokalt på din enhet,
          uten opplasting til server.
        </p>
        <p className="hint">{fileCountLabel}</p>
      </header>

      <UploadDropzone onFilesSelected={addFiles} disabled={isConverting} />

      <OutputSettings
        outputFormat={outputFormat}
        resizeMode={resizeMode}
        resizeWidth={resizeWidth}
        qualityPercent={qualityPercent}
        onOutputFormatChange={setOutputFormat}
        onResizeModeChange={setResizeMode}
        onResizeWidthChange={setResizeWidth}
        onQualityPercentChange={(value) => setQualityPercent(clampQualityPercent(value))}
        onConvertAll={convertAll}
        disabled={!hasFiles}
        isConverting={isConverting}
      />

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

      <FileList files={files} onRemoveFile={removeFile} disableRemove={isConverting} />
    </main>
  );
};
