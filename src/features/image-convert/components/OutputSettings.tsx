import type { OutputImageFormat, ResizeMode } from '../types/imageTypes';

interface OutputSettingsProps {
  outputFormat: OutputImageFormat;
  resizeMode: ResizeMode;
  resizeWidth: string;
  qualityPercent: number;
  onOutputFormatChange: (format: OutputImageFormat) => void;
  onResizeModeChange: (mode: ResizeMode) => void;
  onResizeWidthChange: (width: string) => void;
  onQualityPercentChange: (value: number) => void;
  onConvertAll: () => void;
  disabled?: boolean;
  isConverting?: boolean;
}

const supportsQuality = (format: OutputImageFormat): boolean => format !== 'png';

export const OutputSettings = ({
  outputFormat,
  resizeMode,
  resizeWidth,
  qualityPercent,
  onOutputFormatChange,
  onResizeModeChange,
  onResizeWidthChange,
  onQualityPercentChange,
  onConvertAll,
  disabled = false,
  isConverting = false,
}: OutputSettingsProps) => {
  const showQualitySetting = supportsQuality(outputFormat);

  return (
    <section className="panel">
      <h2>Output-innstillinger</h2>

      <div className="settings-grid">
        <div className="settings-field">
          <label htmlFor="output-format">Velg format</label>
          <select
            id="output-format"
            value={outputFormat}
            onChange={(event) => onOutputFormatChange(event.target.value as OutputImageFormat)}
            disabled={disabled}
          >
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
          </select>
        </div>

        <div className="settings-field">
          <label htmlFor="resize-mode">Resize</label>
          <select
            id="resize-mode"
            value={resizeMode}
            onChange={(event) => onResizeModeChange(event.target.value as ResizeMode)}
            disabled={disabled}
          >
            <option value="none">Ingen resize</option>
            <option value="width">Angi bredde</option>
          </select>
        </div>

        <div className="settings-field">
          <label htmlFor="resize-width">Bredde (px)</label>
          <input
            id="resize-width"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={resizeWidth}
            onChange={(event) => onResizeWidthChange(event.target.value)}
            disabled={disabled || resizeMode === 'none'}
            placeholder="f.eks. 1200"
          />
          <p className="hint">Høyde beregnes automatisk for å bevare proporsjoner.</p>
        </div>

        {showQualitySetting ? (
          <div className="settings-field">
            <label htmlFor="quality-range">Kvalitet ({qualityPercent}%)</label>
            <input
              id="quality-range"
              type="range"
              min={60}
              max={100}
              step={1}
              value={qualityPercent}
              onChange={(event) => onQualityPercentChange(Number(event.target.value))}
              disabled={disabled}
            />
            <p className="hint">
              Gjelder kun for {outputFormat.toUpperCase()}. Høyere verdi gir bedre kvalitet og ofte
              større fil.
            </p>
          </div>
        ) : (
          <p className="hint">
            PNG bruker tapsfri komprimering. Kvalitetsslider er derfor skjult for dette formatet.
          </p>
        )}
      </div>

      <button
        type="button"
        className="button button--primary"
        onClick={onConvertAll}
        disabled={disabled || isConverting}
      >
        {isConverting ? 'Konverterer...' : 'Konverter og last ned alle'}
      </button>
    </section>
  );
};
