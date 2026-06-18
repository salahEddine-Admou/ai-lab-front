import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ActionOverlay, LoadingButton, PageLoader } from '../components/Loader';

export default function Interviews() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api
      .getInterviewDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSync = async () => {
    setSyncError('');
    setSyncing(true);
    try {
      await api.syncInterviews(5);
      load();
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <main className="page-main max-w-3xl">
        <PageLoader label="Chargement des entretiens…" />
      </main>
    );
  }

  const simulations = data?.simulations || [];
  const pendingMatches = data?.pendingMatches || [];
  const canGenerate = data?.canGenerate;

  return (
    <main className="page-main max-w-3xl">
      <ActionOverlay
        show={syncing}
        label="Génération des questions d'entretien par IA…"
      />

      <h1 className="page-title">Simulations d&apos;entretien</h1>
      <p className="mt-1 text-neutral-400">
        Questions personnalisées par poste, avec conseils et exemples de réponses
      </p>

      {!canGenerate ? (
        <div className="card mt-6 border-amber-500/30 bg-amber-950/20">
          <p className="text-sm text-amber-100">
            Pour débloquer les entretiens, complétez d&apos;abord votre profil :
          </p>
          <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-neutral-300">
            <li>
              <Link to="/onboarding" className="text-orange-400 hover:underline">
                Onboarding
              </Link>{' '}
              (profil + zone)
            </li>
            <li>
              <Link to="/cv" className="text-orange-400 hover:underline">
                Analyser votre CV
              </Link>
            </li>
            <li>
              <Link to="/companies" className="text-orange-400 hover:underline">
                Parcourir les offres
              </Link>{' '}
              ou générer depuis le tableau de bord
            </li>
          </ol>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <LoadingButton
            className="btn-primary w-full sm:w-auto"
            onClick={handleSync}
            loading={syncing}
            loadingLabel="Génération…"
          >
            {simulations.length
              ? 'Générer plus de simulations'
              : 'Générer mes simulations'}
          </LoadingButton>
          <Link to="/companies" className="btn-secondary w-full text-center text-xs sm:w-auto">
            Voir les offres
          </Link>
        </div>
      )}

      {syncError && <p className="mt-4 text-sm text-red-400">{syncError}</p>}

      {canGenerate && simulations.length === 0 && !syncing && (
        <p className="mt-6 text-sm text-neutral-500">
          Aucune simulation pour l&apos;instant. Cliquez sur « Générer mes simulations » (environ
          30 s par poste), ou ouvrez une offre et choisissez « Préparer un entretien ».
        </p>
      )}

      {simulations.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Vos simulations ({simulations.length})
          </h2>
          {simulations.map((sim) => (
            <Link
              key={sim._id}
              to={`/interviews/${sim._id}`}
              className="card flex flex-col gap-3 transition hover:border-orange-500/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{sim.company?.name}</p>
                <p className="text-sm text-orange-300">{sim.jobTitle}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {sim.questions?.length || 0} questions · {sim.company?.city}
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-2xl font-bold text-orange-400">{sim.matchScore}%</p>
                <p className="text-xs text-orange-500">Ouvrir la simulation →</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pendingMatches.length > 0 && canGenerate && (
        <div className="card mt-8">
          <h2 className="text-sm font-semibold text-neutral-300">
            Postes compatibles sans simulation ({pendingMatches.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {pendingMatches.map((m) => (
              <li
                key={m.company._id}
                className="flex flex-col gap-2 border border-neutral-800 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-neutral-300">
                  {m.company.name} — {m.matchScore}% match
                </span>
                <Link
                  to={`/offers/${m.company._id}`}
                  className="text-xs text-orange-400 hover:underline"
                >
                  Voir l&apos;offre →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
