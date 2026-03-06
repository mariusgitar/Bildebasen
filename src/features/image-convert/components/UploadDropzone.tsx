import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void | Promise<void>;
  disabled?: boolean;
}

export const UploadDropzone = ({
  onFilesSelected,
  disabled = false,
}: UploadDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const emitFiles = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    onFilesSelected(Array.from(fileList));
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    emitFiles(event.target.files);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    if (disabled) {
      return;
    }

    emitFiles(event.dataTransfer.files);
  };

  return (
    <section className="panel">
      <h2>Last opp bilder</h2>
      <div
        className={`dropzone ${dragActive ? 'dropzone--active' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setDragActive(true);
          }
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
      >
        <p>Dra og slipp bilder her, eller velg filer.</p>
        <button
          type="button"
          className="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          Velg filer
        </button>
        <p className="hint">Støtter JPG/JPEG, PNG, WEBP, HEIC og HEIF.</p>
        <p className="hint">Merk: Enkelte HEIC/HEIF-filer kan variere i støtte i nettleser.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={onInputChange}
          hidden
        />
      </div>
    </section>
  );
};
