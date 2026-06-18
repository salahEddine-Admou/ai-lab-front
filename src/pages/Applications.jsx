import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ActionOverlay, LoadingButton, PageLoader } from '../components/Loader';

const STATUS_LABELS = {
  draft: 'Brouillon',
  pending_review: 'À valider',
  scheduled: 'Planifié',
  sent: 'Envoyé',
  replied: 'Réponse reçue',
  interview: 'Entretien',
};

const STATUS_OPTIONS = ['pending_review', 'scheduled', 'sent', 'replied', 'interview'];

export default function Applications() {
  const { refreshUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [busyLabel, setBusyLabel] = useState('');

  const load = () => {
    setLoading(true);
    api
      .getApplications()
      .then(({ applications: a }) => setApplications(a))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const updateStatus = async (id, status) => {
    setBusyLabel('Mise à jour du statut…');
    setBusy(id);
    try {
      await api.updateApplication(id, { status });
      load();
    } finally {
      setBusy(null);
    }
  };

  const regenerate = async (id) => {
    setBusyLabel('Régénération de la lettre par IA…');
    setBusy(id);
    try {
      await api.regenerateLetter(id);
      await refreshUser();
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(null);
    }
  };

  const saveLetter = async (id, coverLetter) => {
    setBusyLabel('Enregistrement de la lettre…');
    setBusy(id);
    try {
      await api.updateApplication(id, { coverLetter });
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="page-main max-w-4xl">
      <ActionOverlay show={!!busy} label={busyLabel} />
      <h1 className="page-title">Mes candidatures</h1>
      <p className="mt-1 text-neutral-400">
        Validez les lettres, planifiez l&apos;envoi et suivez les réponses
      </p>

      {loading ? (
        <PageLoader label="Chargement de vos candidatures…" />
      ) : applications.length === 0 ? (
        <div className="card mt-8 text-center text-neutral-500">
          Aucune candidature.{' '}
          <a href="/companies" className="text-orange-400 hover:underline">
            Cibler des entreprises
          </a>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((app) => (
            <article key={app._id} className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white">{app.company?.name}</h2>
                  <p className="text-sm text-neutral-500">
                    {app.company?.city} · {app.company?.sector}
                  </p>
                  <p className="mt-2 text-xs text-orange-400">
                    Personnalisation {app.personalizationScore}%
                  </p>
                </div>
                <span className="border border-orange-500/20 bg-neutral-900 px-3 py-1 text-xs font-medium text-orange-400">
                  {STATUS_LABELS[app.status] || app.status}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <select
                  className="input w-full text-xs sm:max-w-[200px]"
                  value={app.status}
                  onChange={(e) => updateStatus(app._id, e.target.value)}
                  disabled={busy === app._id}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-secondary w-full text-xs sm:w-auto"
                  onClick={() => setExpanded(expanded === app._id ? null : app._id)}
                >
                  {expanded === app._id ? 'Masquer' : 'Voir la lettre'}
                </button>
                <LoadingButton
                  className="btn-secondary w-full text-xs sm:w-auto"
                  onClick={() => regenerate(app._id)}
                  loading={busy === app._id}
                  loadingLabel="IA…"
                  disabled={!!busy && busy !== app._id}
                >
                  Régénérer la lettre
                </LoadingButton>
              </div>

              {expanded === app._id && (
                <LetterEditor
                  letter={app.coverLetter}
                  onSave={(text) => saveLetter(app._id, text)}
                  busy={busy === app._id}
                />
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function LetterEditor({ letter, onSave, busy }) {
  const [text, setText] = useState(letter);

  return (
    <div className="mt-4">
      <textarea
        className="input min-h-[200px] font-mono text-xs whitespace-pre-wrap"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <LoadingButton
        className="btn-primary mt-2 text-xs"
        onClick={() => onSave(text)}
        loading={busy}
        loadingLabel="Enregistrement…"
      >
        Enregistrer les modifications
      </LoadingButton>
    </div>
  );
}
