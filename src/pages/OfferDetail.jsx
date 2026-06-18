import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ActionOverlay, LoadingButton, PageLoader } from '../components/Loader';

const SOURCE_LABELS = {
  remotive: 'Remotive',
  arbeitnow: 'Arbeitnow',
  adzuna: 'Adzuna',
};

const CONTRACT_LABELS = {
  full_time: 'Temps plein',
  part_time: 'Temps partiel',
  contract: 'Contrat',
  freelance: 'Freelance',
  berufserfahren: 'Expérimenté',
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionLabel, setActionLabel] = useState('');

  useEffect(() => {
    api
      .getCompany(id)
      .then(({ company }) => setOffer(company))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setActionLabel('Création de votre candidature…');
    setActionLoading(true);
    setMessage('');
    try {
      await api.createApplication(id);
      await refreshUser();
      setMessage('Candidature créée avec lettre personnalisée');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInterview = async () => {
    setActionLabel('Génération de la simulation d\'entretien…');
    setActionLoading(true);
    setMessage('');
    try {
      const { simulation } = await api.createInterviewForCompany(id);
      await refreshUser();
      if (simulation?._id) {
        navigate(`/interviews/${simulation._id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="page-main max-w-3xl">
        <PageLoader label="Chargement de l'offre…" />
      </main>
    );
  }

  if (error || !offer) {
    return (
      <main className="page-main max-w-3xl">
        <p className="text-red-400">{error || 'Offre introuvable'}</p>
        <Link to="/companies" className="btn-primary mt-4 inline-flex text-xs">
          Retour aux offres
        </Link>
      </main>
    );
  }

  const body = offer.fullDescription || offer.description || '';
  const published = formatDate(offer.publishedAt);

  return (
    <main className="page-main max-w-3xl">
      <ActionOverlay show={actionLoading} label={actionLabel} />
      <Link to="/companies" className="text-sm text-orange-400 hover:underline">
        ← Offres d&apos;emploi
      </Link>

      {message && (
        <p className="mt-4 bg-orange-950/50 px-3 py-2 text-sm text-orange-200">{message}</p>
      )}

      <header className="card mt-6">
        {offer.source && (
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            {SOURCE_LABELS[offer.source] || offer.source}
          </span>
        )}
        <h1 className="mt-2 text-xl font-bold text-white break-words sm:text-2xl">
          {offer.jobTitle || offer.name}
        </h1>
        <p className="mt-2 text-lg text-orange-400">{offer.name}</p>
        <p className="mt-1 text-sm text-neutral-400">{offer.sector}</p>

        <ul className="mt-4 flex flex-wrap gap-2 text-sm text-neutral-300">
          <li className="bg-neutral-900 px-2 py-1">{offer.city}</li>
          {offer.region && offer.region !== offer.city && (
            <li className="bg-neutral-900 px-2 py-1">{offer.region}</li>
          )}
          {offer.isRemote && (
            <li className="bg-orange-950 px-2 py-1 text-orange-300">Télétravail</li>
          )}
          {offer.salary && (
            <li className="bg-neutral-900 px-2 py-1">{offer.salary}</li>
          )}
          {offer.contractType && (
            <li className="bg-neutral-900 px-2 py-1">
              {CONTRACT_LABELS[offer.contractType] || offer.contractType}
            </li>
          )}
          {published && (
            <li className="bg-neutral-900 px-2 py-1">Publié le {published}</li>
          )}
        </ul>

        {offer.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {offer.tags.map((tag) => (
              <span
                key={tag}
                className="border border-neutral-700 px-2 py-0.5 text-xs text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <LoadingButton
            className="btn-primary w-full sm:w-auto"
            onClick={handleApply}
            loading={actionLoading}
            loadingLabel="Candidature…"
          >
            Candidater
          </LoadingButton>
          <LoadingButton
            className="btn-secondary w-full sm:w-auto"
            onClick={handleInterview}
            loading={actionLoading}
            loadingLabel="Préparation…"
          >
            Préparer un entretien
          </LoadingButton>
        </div>
      </header>

      <section className="card mt-6">
        <h2 className="text-lg font-semibold text-white">Description du poste</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
          {body}
        </p>
      </section>

      {(offer.website || offer.hrEmail) && (
        <section className="card mt-4 text-sm text-neutral-400">
          <h2 className="font-semibold text-white">Entreprise</h2>
          {offer.website && !offer.website.includes('remotive.com') && !offer.website.includes('arbeitnow.com') && (
            <p className="mt-2">
              Site :{' '}
              <a
                href={offer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline"
              >
                {offer.website.replace(/^https?:\/\//, '')}
              </a>
            </p>
          )}
          {offer.hrEmail && <p className="mt-1">Contact RH : {offer.hrEmail}</p>}
        </section>
      )}
    </main>
  );
}
