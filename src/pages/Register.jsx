import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActionOverlay, LoadingButton } from '../components/Loader';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-main flex min-h-[calc(100vh-3.5rem)] items-center justify-center sm:min-h-[calc(100vh-4rem)]">
      <ActionOverlay show={loading} label="Création de votre compte…" />
      <div className="card w-full max-w-md border-orange-500/20">
        <h1 className="page-title">Créer un compte</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Accédez à toutes les fonctionnalités d&apos;AI RH
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <div>
            <label className="label" htmlFor="name">
              Nom complet
            </label>
            <input
              id="name"
              className="input"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Mot de passe (6 car. min.)
            </label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <LoadingButton
            type="submit"
            className="btn-primary w-full"
            loading={loading}
            loadingLabel="Création…"
          >
            Créer mon compte
          </LoadingButton>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-orange-400 hover:underline">
            Connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
