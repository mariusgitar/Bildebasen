interface ConversionProgressProps {
  current: number;
  total: number;
  statusMessage: string;
  complete: boolean;
}

export const ConversionProgress = ({
  current,
  total,
  statusMessage,
  complete,
}: ConversionProgressProps) => {
  const percent = complete ? 100 : Math.round(((current - 1) / total) * 100);

  return (
    <section
      className={`conversion-progress${complete ? ' conversion-progress--complete' : ''}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="conversion-progress__labels">
        <strong>
          {complete ? 'Ferdig! Alle bildene er klare 🎉' : `Konverterer bilde ${current} av ${total}`}
        </strong>
        {!complete ? <span>{statusMessage}</span> : <span>Klar for nedlasting.</span>}
      </div>
      <div
        className="conversion-progress__track"
        role="progressbar"
        aria-label="Fremdrift for bildekonvertering"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={complete ? total : current - 1}
      >
        <div className="conversion-progress__fill" style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
};
