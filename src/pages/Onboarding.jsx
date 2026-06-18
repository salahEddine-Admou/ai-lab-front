import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ActionOverlay, LoadingButton } from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const PROFILES = [
  { id: 'stage', label: 'Je cherche un stage' },
  { id: 'alternance', label: 'Je cherche une alternance' },
  { id: 'sans-emploi-urgent', label: 'Sans emploi — besoin urgent' },
  { id: 'sans-emploi-detendu', label: 'Sans emploi — pas stressé(e)' },
  { id: 'mal-employe', label: 'Mal employé(e) — besoin de changer' },
  { id: 'employe-ouvert', label: 'Employé(e) — ouvert aux opportunités' },
  { id: 'reconversion', label: 'En reconversion professionnelle' },
  { id: 'freelance', label: 'Freelance — missions' },
];

export default function Onboarding() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [targetRadius, setTargetRadius] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileType) {
      setError('Sélectionnez votre profil');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.onboarding({ profileType, targetLocation, targetRadius });
      await refreshUser();
      navigate('/cv');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-main max-w-2xl">
      <ActionOverlay show={loading} label="Enregistrement de votre profil…" />
      <h1 className="page-title">Votre situation</h1>
      <p className="mt-1 text-neutral-400">Étape 1 sur 2 — personnalisation de la recherche</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <p className="bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {PROFILES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProfileType(p.id)}
              className={`card text-left text-sm transition ${
                profileType === p.id
                  ? 'border-orange-500 bg-orange-950/30'
                  : 'hover:border-neutral-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label" htmlFor="location">
              Ville ou code postal cible
            </label>
            <input
              id="location"
              className="input"
              placeholder="ex. Casablanca, Rabat, Lyon…"
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="radius">
              Rayon de recherche : {targetRadius} km
            </label>
            <input
              id="radius"
              type="range"
              min={5}
              max={100}
              value={targetRadius}
              onChange={(e) => setTargetRadius(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>
        </div>

        <LoadingButton
          type="submit"
          className="btn-primary w-full sm:max-w-xs"
          loading={loading}
          loadingLabel="Enregistrement…"
        >
          Continuer vers l&apos;analyse CV
        </LoadingButton>
      </form>
    </main>
  );
}
