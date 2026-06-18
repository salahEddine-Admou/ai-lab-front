import React from 'react';

/** AI Core Animated Loader */
export function LoaderBars({ className = '' }) {
  return (
    <div className={`ai-core-container ${className}`} aria-hidden>
      <div className="ai-core-ring"></div>
      <div className="ai-core-orb"></div>
      <div className="ai-core-particles">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function PageLoader({ label = 'Analyse par l’IA en cours…' }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-6 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoaderBars />
      <div className="flex flex-col items-center gap-1.5 mt-2">
        <p className="text-sm font-bold tracking-widest text-orange-400 uppercase ai-pulse-text">{label}</p>
        <p className="text-xs text-neutral-600 font-mono tracking-widest">LAB.AI // MODULE ACTIF</p>
      </div>
    </div>
  );
}

/** Full-screen feedback after a click (API calls) */
export function ActionOverlay({ show, label = 'Traitement neuronal en cours…' }) {
  if (!show) return null;

  return (
    <div
      className="loader-overlay backdrop-blur-md bg-black/60"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={label}
    >
      <div className="loader-overlay-panel">
        <LoaderBars />
        <div className="mt-8 flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-bold tracking-wider text-orange-400 uppercase ai-pulse-text">{label}</p>
          <p className="text-[10px] text-neutral-500 font-mono tracking-widest">SYNCHRONISATION DATA...</p>
        </div>
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
      className={`${className} relative overflow-hidden transition-all duration-300`}
      disabled={loading || props.disabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2.5 relative z-10">
          <div className="flex items-center justify-center h-4 w-4 relative" aria-hidden>
             <div className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin opacity-70"></div>
             <div className="absolute inset-1 rounded-full bg-current opacity-30 animate-pulse"></div>
          </div>
          <span className="font-mono tracking-widest text-xs uppercase">{loadingLabel}</span>
        </span>
      ) : (
        children
      )}
      {loading && (
        <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
      )}
    </button>
  );
}
