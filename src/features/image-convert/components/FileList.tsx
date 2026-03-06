import { formatFileSize } from '../lib/fileValidation';
import type { UploadedImage } from '../types/imageTypes';

interface FileListProps {
  files: UploadedImage[];
}

const formatLabelFromMime = (mimeType: string): string => {
  if (mimeType === 'image/jpeg') {
    return 'JPG/JPEG';
  }

  if (mimeType === 'image/png') {
    return 'PNG';
  }

  return 'WEBP';
};

export const FileList = ({ files }: FileListProps) => {
  if (files.length === 0) {
    return (
      <section className="panel">
        <h2>Filer</h2>
        <p className="empty-state">Ingen filer lagt til enda.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Filer</h2>
      <ul className="file-grid">
        {files.map((file) => (
          <li key={file.id} className="file-card">
            <img src={file.previewUrl} alt={`Forhåndsvisning av ${file.name}`} />
            <div className="file-card__meta">
              <strong title={file.name}>{file.name}</strong>
              <span>Format: {formatLabelFromMime(file.mimeType)}</span>
              <span>Størrelse: {formatFileSize(file.size)}</span>
              <span className={`status status--${file.status}`}>
                {file.status === 'klar' && 'Klar for konvertering'}
                {file.status === 'konverterer' && 'Konverterer...'}
                {file.status === 'ferdig' && 'Ferdig'}
                {file.status === 'feil' && file.errorMessage}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
