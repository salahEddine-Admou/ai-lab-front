import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ActionOverlay, LoadingButton, PageLoader } from '../components/Loader';

export default function Companies() {
  const { user, refreshUser } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [filters, setFilters] = useState({
    q: '',
    sector: '',
    city: '',
    remote: '',
    page: 1,
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [overlayLabel, setOverlayLabel] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanies(filters);
      setCompanies(data.companies);
      setTotal(data.total);
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getSectors().then(({ sectors: s }) => setSectors(s)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [filters.page, filters.sector, filters.city, filters.remote]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
    load();
  };

  const applySingle = async (companyId) => {
    setOverlayLabel('Création de votre candidature…');
    setActionLoading(true);
    setMessage('');
    try {
      await api.createApplication(companyId);
      await refreshUser();
      setMessage('Candidature créée avec lettre personnalisée');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSync = async () => {
    setOverlayLabel('Synchronisation des offres réelles…');
    setSyncing(true);
    setMessage('');
    try {
      const result = await api.syncJobs();
      if (result.skipped) {
        setMessage('Offres déjà à jour');
      } else {
        setMessage(`${result.upserted || result.total} offre(s) synchronisée(s)`);
      }
      await load();
      const { sectors: s } = await api.getSectors();
      setSectors(s);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const applyBatch = async () => {
    if (!selected.size) return;
    setOverlayLabel(`Candidature en lot (${selected.size})…`);
    setActionLoading(true);
    setMessage('');
    try {
      const { count } = await api.batchApplications([...selected]);
      await refreshUser();
      setSelected(new Set());
      setMessage(`${count} candidature(s) créée(s)`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const busy = actionLoading || syncing;

  return (
    <main className="page-main">
      <ActionOverlay show={busy} label={overlayLabel} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="page-title">Offres d&apos;emploi réelles</h1>
          <p className="mt-1 text-neutral-400">
            {total} offre(s)
            {user?.targetLocation ? ` · zone : ${user.targetLocation}` : ''}
          </p>
        </div>
        <LoadingButton
          className="btn-secondary w-full text-xs sm:w-auto"
          onClick={handleSync}
          loading={syncing}
          loadingLabel="Actualisation…"
          disabled={actionLoading}
        >
          Actualiser les offres
        </LoadingButton>
        {selected.size > 0 && (
          <LoadingButton
            className="btn-primary w-full sm:w-auto"
            onClick={applyBatch}
            loading={actionLoading}
            loadingLabel="Envoi…"
            disabled={syncing}
          >
            Candidater en lot ({selected.size})
          </LoadingButton>
        )}
      </div>

      {message && (
        <p className="mt-4 bg-orange-950/50 px-3 py-2 text-sm text-orange-200">
          {message}
        </p>
      )}

      <form onSubmit={handleSearch} className="card mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
        <input
          className="input sm:col-span-2 lg:col-span-2"
          placeholder="Recherche (nom, secteur…)"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <select
          className="input"
          value={filters.sector}
          onChange={(e) => setFilters((f) => ({ ...f, sector: e.target.value, page: 1 }))}
        >
          <option value="">Tous secteurs</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Ville"
          value={filters.city}
          onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
        />
        <select
          className="input"
          value={filters.remote || ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, remote: e.target.value, page: 1 }))
          }
        >
          <option value="">Tous modes</option>
          <option value="true">Télétravail</option>
          <option value="false">Sur site</option>
        </select>
        <button type="submit" className="btn-primary w-full sm:col-span-2 lg:col-span-1">
          Filtrer
        </button>
      </form>

      {loading ? (
        <PageLoader label="Chargement des offres…" />
      ) : (
        <div className="mt-6 space-y-4">
          {companies.map((c) => (
            <article
              key={c._id}
              className={`card flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${
                selected.has(c._id) ? 'border-orange-500/50' : ''
              }`}
            >
              <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                <input
                  type="checkbox"
                  checked={selected.has(c._id)}
                  onChange={() => toggleSelect(c._id)}
                  className="mt-1 h-4 w-4 accent-orange-500"
                />
                <div className="min-w-0 flex-1">
                  <Link to={`/offers/${c._id}`} className="block hover:opacity-90">
                    {c.jobTitle && (
                      <p className="text-sm font-medium text-orange-300 break-words">{c.jobTitle}</p>
                    )}
                    <h2 className="font-semibold text-white break-words">{c.name}</h2>
                    <p className="text-sm text-orange-400">{c.sector}</p>
                    <p className="mt-1 text-sm text-neutral-400">
                      {c.city}
                      {c.isRemote ? ' · Télétravail' : ''}
                      {c.salary ? ` · ${c.salary}` : ''}
                    </p>
                    {c.description && (
                      <p className="mt-2 max-w-xl text-sm text-neutral-500 line-clamp-3">
                        {c.description}
                      </p>
                    )}
                  </Link>
                  <Link
                    to={`/offers/${c._id}`}
                    className="mt-2 inline-block text-xs text-orange-500 hover:text-orange-400"
                  >
                    Voir le détail →
                  </Link>
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
                <Link to={`/offers/${c._id}`} className="btn-secondary w-full text-center text-xs">
                  Détail
                </Link>
                <LoadingButton
                  className="btn-primary w-full text-xs"
                  onClick={() => applySingle(c._id)}
                  loading={actionLoading}
                  loadingLabel="Envoi…"
                  disabled={syncing}
                >
                  Candidater
                </LoadingButton>
              </div>
            </article>
          ))}
          {companies.length === 0 && (
            <p className="text-center text-neutral-500">
              Aucune offre trouvée. Cliquez sur « Actualiser les offres ».
            </p>
          )}
        </div>
      )}

      {total > 12 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            className="btn-secondary text-xs"
            disabled={filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
          >
            ← Précédent
          </button>
          <span className="flex items-center text-sm text-neutral-500">Page {filters.page}</span>
          <button
            type="button"
            className="btn-secondary text-xs"
            disabled={companies.length < 12}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          >
            Suivant →
          </button>
        </div>
      )}
    </main>
  );
}
