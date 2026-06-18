import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'ai-rh-welcome-video-dismissed';
const EXIT_MS = 550;

const WelcomeVideoContext = createContext(null);

export function WelcomeVideoProvider({ children }) {
  const [forceOpen, setForceOpen] = useState(false);
  const openVideo = () => setForceOpen(true);

  return (
    <WelcomeVideoContext.Provider value={openVideo}>
      <WelcomeVideoModal forceOpen={forceOpen} onClose={() => setForceOpen(false)} />
      {children}
    </WelcomeVideoContext.Provider>
  );
}

export function useWelcomeVideo() {
  const ctx = useContext(WelcomeVideoContext);
  return ctx || (() => {});
}

function WelcomeVideoModal({ forceOpen = false, onClose }) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState('in');
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const exitTimer = useRef(null);

  const shouldShowOnLoad = forceOpen || !sessionStorage.getItem(STORAGE_KEY);

  useEffect(() => {
    if (shouldShowOnLoad) {
      setVisible(true);
      setPhase('in');
      setProgress(0);
    }
  }, [shouldShowOnLoad, forceOpen]);

  useEffect(() => {
    if (!visible) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  const finishClose = useCallback(() => {
    if (!forceOpen) sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
    setPhase('in');
    onClose?.();
  }, [forceOpen, onClose]);

  const startExit = useCallback(() => {
    if (phase === 'out') return;
    videoRef.current?.pause();
    setPhase('out');
    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(finishClose, EXIT_MS);
  }, [phase, finishClose]);

  useEffect(() => {
    if (!visible || phase === 'out') return undefined;

    const video = videoRef.current;
    if (!video) return undefined;

    video.currentTime = 0;

    const tryPlay = () => {
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    };

    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('loadeddata', tryPlay, { once: true });

    return () => video.removeEventListener('loadeddata', tryPlay);
  }, [visible, phase]);

  useEffect(() => () => clearTimeout(exitTimer.current), []);

  if (!visible) return null;

  const backdropClass = phase === 'out' ? 'welcome-backdrop-out' : 'welcome-backdrop-in';
  const panelClass = phase === 'out' ? 'welcome-panel-out' : 'welcome-panel-in';

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-3 sm:p-6 ${backdropClass}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-video-title"
    >
      <div
        className={`relative w-full max-w-5xl overflow-hidden border border-orange-500/50 bg-neutral-950 ${panelClass}`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/80 to-transparent px-4 py-4 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-widest text-orange-400">
            AI LABS · Orange Digital Center Agadir
          </p>
          <h2 id="welcome-video-title" className="text-lg font-bold text-white sm:text-2xl">
            AI RH
          </h2>
          <p className="text-sm text-neutral-300">Recruter. Comprendre. Accompagner.</p>
        </div>

        <button
          type="button"
          onClick={startExit}
          className="absolute right-3 top-3 z-20 border border-neutral-600 bg-black/60 px-3 py-1 text-xs text-neutral-300 backdrop-blur transition hover:border-orange-500 hover:text-white sm:right-4 sm:top-4"
        >
          Passer
        </button>

        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover sm:object-contain"
            src="/video.mp4"
            autoPlay
            playsInline
            muted={false}
            preload="auto"
            onEnded={startExit}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress((v.currentTime / v.duration) * 100);
            }}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-3">
          <div className="h-1 w-full overflow-hidden bg-neutral-800">
            <div
              className="h-full bg-orange-500 transition-[width] duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
