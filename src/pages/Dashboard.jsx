import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { triggerDownload } from '../utils/downloadFile';
import { ActionOverlay, LoadingButton } from '../components/Loader';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [cvAdaptation, setCvAdaptation] = useState(null);
  const [adaptingCv, setAdaptingCv] = useState(false);
  const [downloadingCv, setDownloadingCv] = useState('');

  const loadInterviews = useCallback(() => {
    api.getInterviewDashboard().then(setInterviewData).catch(() => {});
  }, []);

  useEffect(() => {
    api.getStats().then(({ stats: s }) => setStats(s)).catch(() => {});
    loadInterviews();
    api.getCvAdaptation().then(({ adaptation }) => setCvAdaptation(adaptation)).catch(() => {});
  }, [loadInterviews]);

  const handleAdaptCv = async () => {
    setAdaptingCv(true);
    setSyncError('');
    try {
      const data = await api.adaptCv();
      setCvAdaptation(data.adaptation);
    } catch {
      /* shown on /cv */
    } finally {
      setAdaptingCv(false);
    }
  };

  const handleSyncInterviews = async () => {
    setSyncError('');
    setSyncing(true);
    try {
      await api.syncInterviews(3);
      loadInterviews();
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const cvScoreDisplay =
    user?.cvAdaptedScore != null
      ? `${user.cvScore ?? '—'} → ${user.cvAdaptedScore}`
      : user?.cvScore != null
        ? `${user.cvScore}/100`
        : '—';

  const cards = [
    { label: 'Score CV', value: cvScoreDisplay, href: '/cv' },
    { label: 'Candidatures', value: stats?.total ?? 0, href: '/applications' },
    {
      label: 'Simulations entretien',
      value: interviewData?.totalSimulations ?? 0,
      href: '/interviews',
    },
  ];

  const simulations = interviewData?.simulations || [];
  const pendingMatches = interviewData?.pendingMatches || [];

  const overlayBusy = syncing || adaptingCv || !!downloadingCv;

  const overlayLabel = adaptingCv
    ? 'Adaptation de votre CV…'
    : downloadingCv
      ? 'Préparation du téléchargement…'
      : 'Génération des simulations d\'entretien…';

  return (
    <main className="page-main">
      <ActionOverlay show={overlayBusy} label={overlayLabel} />
      <h1 className="page-title">
        Bonjour, {user?.name?.split(' ')[0] || 'candidat'}
      </h1>
      <p className="mt-1 text-neutral-400">Votre tableau de bord AI RH</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {cards.map((c) =>
          c.href ? (
            <Link key={c.label} to={c.href} className="card transition hover:border-orange-500/40">
              <p className="text-sm text-neutral-500">{c.label}</p>
              <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{c.value}</p>
            </Link>
          ) : (
            <div key={c.label} className="card">
              <p className="text-sm text-neutral-500">{c.label}</p>
              <p className="mt-1 text-2xl font-bold text-orange-400 sm:text-3xl">{c.value}</p>
            </div>
          )
        )}
      </div>

      <section id="cv-adapt" className="card mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-white sm:text-lg">CV corrigé & adapté aux postes</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Corrections IA et version optimisée pour vos entreprises correspondantes
            </p>
          </div>
          {user?.cvText && !cvAdaptation && (
            <LoadingButton
              className="btn-primary w-full shrink-0 text-xs sm:w-auto"
              onClick={handleAdaptCv}
              loading={adaptingCv}
              loadingLabel="Adaptation…"
              disabled={syncing}
            >
              Adapter mon CV
            </LoadingButton>
          )}
        </div>

        {!user?.cvText ? (
          <p className="mt-4 text-sm text-amber-200">
            <Link to="/cv" className="text-orange-400 underline">
              Analysez votre CV
            </Link>{' '}
            pour activer l&apos;adaptation aux postes.
          </p>
        ) : cvAdaptation || user?.cvAdaptedText ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-neutral-500">Score avant</p>
                <p className="text-2xl font-bold text-white">
                  {cvAdaptation?.scoreBefore ?? user?.cvScore ?? '—'}/100
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Score après adaptation</p>
                <p className="text-2xl font-bold text-orange-400">
                  {cvAdaptation?.scoreAfter ?? user?.cvAdaptedScore ?? '—'}/100
                </p>
              </div>
            </div>
            {(cvAdaptation?.summary || user?.cvAdaptationSummary) && (
              <p className="text-sm text-neutral-400">
                {cvAdaptation?.summary || user?.cvAdaptationSummary}
              </p>
            )}
            {(cvAdaptation?.fixes || user?.cvFixes)?.length > 0 && (
              <ul className="space-y-2 text-sm text-neutral-400">
                {(cvAdaptation?.fixes || user?.cvFixes).slice(0, 3).map((f, i) => (
                  <li key={i}>
                    • <span className="text-white">{f.issue}</span> — {f.suggestion}
                  </li>
                ))}
              </ul>
            )}
            {cvAdaptation?.jobTargets?.length > 0 && (
              <p className="text-xs text-neutral-500">
                Ciblé pour {cvAdaptation.jobTargets.length} poste(s) :{' '}
                {cvAdaptation.jobTargets.map((j) => j.companyName).join(', ')}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link to="/cv" className="btn-secondary inline-flex text-xs">
                Modifier le CV →
              </Link>
              <LoadingButton
                className="btn-secondary text-xs"
                loading={downloadingCv === 'txt'}
                loadingLabel="…"
                disabled={!!downloadingCv}
                onClick={async () => {
                  setDownloadingCv('txt');
                  try {
                    const { blob, filename } = await api.downloadCv('txt');
                    triggerDownload(blob, filename);
                  } catch {
                    /* redirect to /cv */
                  } finally {
                    setDownloadingCv('');
                  }
                }}
              >
                Télécharger .txt
              </LoadingButton>
              <LoadingButton
                className="btn-secondary text-xs"
                loading={downloadingCv === 'docx'}
                loadingLabel="…"
                disabled={!!downloadingCv}
                onClick={async () => {
                  setDownloadingCv('docx');
                  try {
                    const { blob, filename } = await api.downloadCv('docx');
                    triggerDownload(blob, filename);
                  } catch {
                    /* ignore */
                  } finally {
                    setDownloadingCv('');
                  }
                }}
              >
                Télécharger .docx
              </LoadingButton>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Générez une version de votre CV optimisée pour les postes qui matchent votre profil.
          </p>
        )}
      </section>

      <section id="interviews" className="card mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-white sm:text-lg">Simulations d&apos;entretien</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Postes correspondant à votre profil — questions et conseils IA
            </p>
            <Link to="/interviews" className="mt-2 inline-block text-xs text-orange-400 hover:underline">
              Voir toute la page Entretiens →
            </Link>
          </div>
          {interviewData?.canGenerate && (
            <LoadingButton
              className="btn-primary w-full shrink-0 text-xs sm:w-auto"
              onClick={handleSyncInterviews}
              loading={syncing}
              loadingLabel="Génération…"
              disabled={adaptingCv}
            >
              {simulations.length
                ? 'Générer plus de simulations'
                : 'Générer mes simulations'}
            </LoadingButton>
          )}
        </div>

        {!interviewData?.canGenerate && (
          <p className="mt-4 text-sm text-amber-200">
            <Link to="/cv" className="underline text-orange-400">
              Importez et analysez votre CV
            </Link>{' '}
            pour débloquer les matchs et simulations d&apos;entretien.
          </p>
        )}

        {syncError && <p className="mt-3 text-sm text-red-400">{syncError}</p>}

        {simulations.length > 0 ? (
          <div className="mt-6 space-y-3">
            {simulations.map((sim) => (
              <Link
                key={sim._id}
                to={`/interviews/${sim._id}`}
                className="flex flex-col gap-3 border border-neutral-800 bg-black p-4 transition hover:border-orange-500/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{sim.company?.name}</p>
                  <p className="text-sm text-neutral-400">{sim.jobTitle}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {sim.questions?.length || 0} questions · {sim.company?.city}
                  </p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="text-xl font-bold text-orange-400 sm:text-2xl">{sim.matchScore}%</p>
                  <p className="text-xs text-neutral-500">match profil</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          interviewData?.canGenerate && (
            <p className="mt-6 text-sm text-neutral-500">
              Aucune simulation pour l&apos;instant. Cliquez sur « Générer mes simulations » (environ
              30 s par poste).
            </p>
          )
        )}

        {pendingMatches.length > 0 && interviewData?.canGenerate && (
          <div className="mt-8 border-t border-neutral-800 pt-6">
            <h3 className="text-sm font-medium text-neutral-300">
              Postes compatibles sans simulation ({pendingMatches.length})
            </h3>
            <ul className="mt-3 space-y-2">
              {pendingMatches.slice(0, 4).map((m) => (
                <li
                  key={m.company._id}
                  className="flex items-center justify-between text-sm text-neutral-400"
                >
                  <span>
                    {m.company.name} — {m.matchScore}% match
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <Link to="/cv" className="card group transition hover:border-orange-500/50">
          <span className="text-2xl">📄</span>
          <h2 className="mt-3 font-semibold text-white group-hover:text-orange-300">
            Analyser mon CV
          </h2>
          <p className="mt-1 text-sm text-neutral-400">Score, feedback et secteurs suggérés</p>
        </Link>
        <Link to="/companies" className="card group transition hover:border-orange-500/50">
          <span className="text-2xl">🎯</span>
          <h2 className="mt-3 font-semibold text-white group-hover:text-orange-300">
            Cibler des entreprises
          </h2>
          <p className="mt-1 text-sm text-neutral-400">Recherche par secteur, ville et taille</p>
        </Link>
        <Link to="/applications" className="card group transition hover:border-orange-500/50">
          <span className="text-2xl">✉️</span>
          <h2 className="mt-3 font-semibold text-white group-hover:text-orange-300">
            Mes candidatures
          </h2>
          <p className="mt-1 text-sm text-neutral-400">Lettres IA, validation et envoi</p>
        </Link>
        <Link to="/interviews" className="card group transition hover:border-orange-500/50">
          <span className="text-2xl">🎤</span>
          <h2 className="mt-3 font-semibold text-white group-hover:text-orange-300">
            Simulations entretien
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            {interviewData?.totalSimulations ?? 0} simulation(s) — questions IA
          </p>
        </Link>
      </div>

      {user?.cvFeedback?.length > 0 && (
        <div className="card mt-10">
          <h3 className="font-semibold text-white">Derniers conseils CV</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-400">
            {user.cvFeedback.slice(0, 4).map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>
      )}

      {!user?.onboardingComplete && (
        <div className="mt-6 border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
          Terminez l&apos;{' '}
          <Link to="/onboarding" className="underline">
            onboarding
          </Link>{' '}
          pour optimiser le ciblage.
        </div>
      )}
    </main>
  );
}
