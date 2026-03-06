import type { OutputImageFormat } from '../types/imageTypes';

interface OutputSettingsProps {
  value: OutputImageFormat;
  onChange: (format: OutputImageFormat) => void;
  onConvertAll: () => void;
  disabled?: boolean;
  isConverting?: boolean;
}

export const OutputSettings = ({
  value,
  onChange,
  onConvertAll,
  disabled = false,
  isConverting = false,
}: OutputSettingsProps) => (
  <section className="panel">
    <h2>Output-innstillinger</h2>
    <div className="settings-row">
      <label htmlFor="output-format">Velg format</label>
      <select
        id="output-format"
        value={value}
        onChange={(event) => onChange(event.target.value as OutputImageFormat)}
        disabled={disabled}
      >
        <option value="jpg">JPG</option>
        <option value="png">PNG</option>
        <option value="webp">WEBP</option>
      </select>
      <button
        type="button"
        className="button button--primary"
        onClick={onConvertAll}
        disabled={disabled || isConverting}
      >
        {isConverting ? 'Konverterer...' : 'Konverter og last ned alle'}
      </button>
    </div>
  </section>
);
