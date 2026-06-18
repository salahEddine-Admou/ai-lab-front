/** Animated bars — page / overlay */
export function LoaderBars({ className = '' }) {
  return (
    <div className={`loader-bars ${className}`} aria-hidden>
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

export function PageLoader({ label = 'Chargement…' }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-5 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoaderBars />
      <p className="text-sm font-medium tracking-wide text-neutral-400">{label}</p>
    </div>
  );
}

/** Full-screen feedback after a click (API calls) */
export function ActionOverlay({ show, label = 'Traitement en cours…' }) {
  if (!show) return null;

  return (
    <div
      className="loader-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={label}
    >
      <div className="loader-overlay-panel">
        <LoaderBars />
        <p className="mt-5 text-sm font-semibold text-orange-200">{label}</p>
        <p className="mt-1 text-xs text-neutral-500">Merci de patienter</p>
      </div>
    </div>
  );
}

export function LoadingButton({
  loading,
  loadingLabel,
  children,
  className = 'btn-primary',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={className}
      disabled={loading || props.disabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2.5">
          {/* Small inline version of animated bars for buttons */}
          <div className="flex h-4 items-end justify-center gap-0.5" aria-hidden>
            <span className="w-0.5 bg-current opacity-70 animate-[loader-bar_0.8s_ease-in-out_infinite]" />
            <span className="w-0.5 bg-current opacity-70 animate-[loader-bar_0.8s_ease-in-out_infinite_0.1s]" />
            <span className="w-0.5 bg-current opacity-70 animate-[loader-bar_0.8s_ease-in-out_infinite_0.2s]" />
            <span className="w-0.5 bg-current opacity-70 animate-[loader-bar_0.8s_ease-in-out_infinite_0.3s]" />
          </div>
          <span>{loadingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
