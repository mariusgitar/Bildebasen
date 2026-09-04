import { useEffect, useMemo, useRef, useState } from 'react';
import { convertImageFile } from '../lib/imageConverter';
import { decodeHeicToBrowserImage, isHeicFile } from '../lib/heicDecoder';
import {
  downloadAllIndividually,
  downloadBlob,
  downloadResultsAsZip,
} from '../lib/download';
import { validateImageFile } from '../lib/fileValidation';
import { getConversionStatusMessage } from '../lib/progress';
import type {
  ConversionResult,
  OutputImageFormat,
  ResizeMode,
  UploadedImage,
} from '../types/imageTypes';
import { ConversionProgress } from './ConversionProgress';
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
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const [conversionResults, setConversionResults] = useState<ConversionResult[]>([]);
  const [progress, setProgress] = useState<{
    phase: 'reading' | 'converting';
    current: number;
    completed: number;
    total: number;
    statusMessage: string;
    complete: boolean;
  } | null>(null);

  const previewsRef = useRef<string[]>([]);

  useEffect(() => {
    previewsRef.current = files.map((file) => file.previewUrl);
  }, [files]);

  useEffect(() => () => {
    previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const hasFiles = files.length > 0;

  const addFiles = async (incomingFiles: File[]) => {
    if (incomingFiles.length === 0) {
      return;
    }

    const nextFiles: UploadedImage[] = [];
    const invalidMessages: string[] = [];

    setIsReadingFiles(true);
    setProgress({
      phase: 'reading',
      current: 0,
      completed: 0,
      total: incomingFiles.length,
      statusMessage: 'Gjør filene klare for konvertering.',
      complete: false,
    });

    // Give React and the browser one paint opportunity before file decoding starts.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    for (const [index, file] of incomingFiles.entries()) {
      const validation = validateImageFile(file);

      if (!validation.valid) {
        invalidMessages.push(`${file.name}: ${validation.message}`);
        setProgress((previous) => previous && {
          ...previous,
          completed: index + 1,
        });
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

        if (isHeicFile(file)) {
          nextFiles.push({
            id: createId(),
            file,
            sourceFile: file,
            name: file.name,
            mimeType: validation.mimeType,
            size: file.size,
            previewUrl: URL.createObjectURL(file),
            status: 'feil',
            errorMessage: message,
          });
        }
      }

      setProgress((previous) => previous && {
        ...previous,
        completed: index + 1,
      });
    }

    if (invalidMessages.length > 0) {
      setErrorMessage(invalidMessages.join(' '));
    } else {
      setErrorMessage(null);
    }

    if (nextFiles.length > 0) {
      setConversionResults([]);
      setFiles((prev) => [...prev, ...nextFiles]);
    }

    setProgress(null);
    setIsReadingFiles(false);
  };

  const setStatusForAll = (status: UploadedImage['status']) => {
    setFiles((prev) => prev.map((item) => ({ ...item, status, errorMessage: undefined })));
  };

  const removeFile = (id: string) => {
    setConversionResults([]);
    setProgress(null);
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
    setConversionResults([]);
    setStatusForAll('konverterer');

    const failures: string[] = [];
    const results: ConversionResult[] = [];

    for (const [index, item] of files.entries()) {
      setProgress({
        phase: 'converting',
        current: index + 1,
        completed: index,
        total: files.length,
        statusMessage: getConversionStatusMessage(index, files.length),
        complete: false,
      });

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

        results.push(result);

        if (files.length === 1) {
          downloadBlob(result.blob, result.filename);
        }

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
      setProgress(null);
    } else {
      setProgress({
        phase: 'converting',
        current: files.length,
        completed: files.length,
        total: files.length,
        statusMessage: '',
        complete: true,
      });
    }

    setConversionResults(files.length > 1 ? results : []);
    setIsConverting(false);
  };

  const downloadZip = async () => {
    setIsCreatingZip(true);
    setErrorMessage(null);

    try {
      await downloadResultsAsZip(conversionResults);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kunne ikke lage ZIP-filen.';
      setErrorMessage(message);
    } finally {
      setIsCreatingZip(false);
    }
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

      <UploadDropzone onFilesSelected={addFiles} disabled={isConverting || isReadingFiles} />

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
        disabled={!hasFiles || isReadingFiles}
        isConverting={isConverting}
      />

      {progress ? <ConversionProgress {...progress} /> : null}

      {conversionResults.length > 0 ? (
        <section className="download-options panel" aria-labelledby="download-heading">
          <h2 id="download-heading">Last ned konverterte bilder</h2>
          <p className="hint">Velg én samlet ZIP-fil eller last ned filene enkeltvis.</p>
          <div className="download-options__actions">
            <button
              className="button button--primary"
              type="button"
              onClick={downloadZip}
              disabled={isCreatingZip}
            >
              {isCreatingZip ? 'Lager ZIP...' : 'Last ned alle som ZIP'}
            </button>
            <button
              className="button"
              type="button"
              onClick={() => downloadAllIndividually(conversionResults)}
              disabled={isCreatingZip}
            >
              Last ned enkeltvis
            </button>
          </div>
        </section>
      ) : null}

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

      <FileList files={files} onRemoveFile={removeFile} disableRemove={isConverting} />
    </main>
  );
};
