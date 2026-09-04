interface ConversionProgressProps {
  phase: 'reading' | 'converting';
  current: number;
  completed: number;
  total: number;
  statusMessage: string;
  complete: boolean;
}

export const ConversionProgress = ({
  phase,
  current,
  completed,
  total,
  statusMessage,
  complete,
}: ConversionProgressProps) => {
  const percent = complete ? 100 : Math.round((completed / total) * 100);
  const isReading = phase === 'reading';

  return (
    <section
      className={`conversion-progress${complete ? ' conversion-progress--complete' : ''}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="conversion-progress__labels">
        <strong>
          {complete
            ? 'Ferdig! Alle bildene er klare 🎉'
            : isReading
              ? `Leser inn ${completed} av ${total} filer...`
              : `Konverterer bilde ${current} av ${total}`}
        </strong>
        {!complete && statusMessage ? <span>{statusMessage}</span> : null}
        {complete ? <span>Klar for nedlasting.</span> : null}
      </div>
      <div
        className="conversion-progress__track"
        role="progressbar"
        aria-label={isReading ? 'Fremdrift for innlesing av filer' : 'Fremdrift for bildekonvertering'}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={complete ? total : completed}
      >
        <div className="conversion-progress__fill" style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
};
