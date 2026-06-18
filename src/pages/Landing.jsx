import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWelcomeVideo } from '../components/WelcomeVideoModal';

const PROFILE_TYPES = [
  { id: 'stage', label: 'Je cherche un stage' },
  { id: 'alternance', label: 'Je cherche une alternance' },
  { id: 'sans-emploi-urgent', label: 'Sans emploi — besoin urgent' },
  { id: 'reconversion', label: 'En reconversion professionnelle' },
  { id: 'freelance', label: 'Freelance — missions' },
  { id: 'employe-ouvert', label: 'Employé(e) — ouvert aux opportunités' },
];

const STEPS = [
  {
    n: 1,
    title: 'Analyse & Stratégie',
    desc: "L'IA comprend votre métier et propose des secteurs cibles pour une recherche efficace.",
  },
  {
    n: 2,
    title: 'Ciblage Intelligent',
    desc: 'Filtrez par poste, ville, rayon et taille d\'entreprise. Contacts RH détectés.',
  },
  {
    n: 3,
    title: 'Rédaction Sur-Mesure',
    desc: 'Lettre unique par entreprise, personnalisée selon le secteur et la description.',
  },
  {
    n: 4,
    title: 'Envoi Automatique',
    desc: 'Validez, planifiez et envoyez depuis votre boîte mail. Suivi des réponses.',
  },
];

function getLandingPaths(user) {
  if (!user) {
    return {
      heroPrimary: '/register',
      heroPrimaryLabel: 'Trouver mes 5 premiers prospects',
      profile: '/register',
      bottomCta: '/register',
      bottomCtaLabel: 'Créer un compte',
    };
  }

  if (!user.onboardingComplete) {
    return {
      heroPrimary: '/onboarding',
      heroPrimaryLabel: 'Compléter mon profil',
      profile: '/onboarding',
      bottomCta: '/onboarding',
      bottomCtaLabel: 'Continuer l\'inscription',
    };
  }

  return {
    heroPrimary: '/companies',
    heroPrimaryLabel: 'Voir les offres',
    profile: '/companies',
    bottomCta: '/dashboard',
    bottomCtaLabel: 'Accéder au tableau de bord',
  };
}

export default function Landing() {
  const { user } = useAuth();
  const openWelcomeVideo = useWelcomeVideo();
  const paths = getLandingPaths(user);

  return (
    <main>
      <section className="relative overflow-hidden px-4 pb-12 pt-10 sm:pb-20 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/25 via-black to-black" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 inline-flex border border-orange-500/30 bg-orange-950/50 px-4 py-1 text-xs font-medium text-orange-300">
            Automatisation IA des candidatures
          </p>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            10h perdues chaque semaine à postuler dans le vide ?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-400 sm:mt-6 sm:text-lg">
            AI RH analyse votre CV, cible les entreprises qui recrutent votre profil,
            rédige des lettres personnalisées et prépare l&apos;envoi automatique.
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
            <Link
              to={paths.heroPrimary}
              className="btn-primary w-full justify-center px-6 py-3 sm:w-auto sm:px-8"
            >
              {paths.heroPrimaryLabel}
            </Link>
            <button
              type="button"
              onClick={openWelcomeVideo}
              className="btn-secondary w-full justify-center px-6 py-3 sm:w-auto sm:px-8"
            >
              Voir la présentation
            </button>
            <Link
              to="/parcours"
              className="btn-secondary w-full justify-center border-orange-500/50 px-6 py-3 sm:w-auto sm:px-8"
            >
              Parcours stand (sans compte)
            </Link>
            <a href="#workflow" className="btn-secondary w-full justify-center px-6 py-3 sm:w-auto sm:px-8">
              Comment ça marche
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
            <li>✓ Style 100% humain</li>
            <li>✓ Validation avant envoi</li>
            <li>✓ Ciblage entreprises</li>
            <li>✓ Lettres personnalisées</li>
          </ul>
        </div>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-950/50 px-4 py-16" id="profiles">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-white">
            Décrivez votre situation professionnelle
          </h2>
          <p className="mt-2 text-center text-neutral-400">
            Sélectionnez votre profil pour découvrir comment AI RH accélère votre recherche.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROFILE_TYPES.map((p) => (
              <Link
                key={p.id}
                to={paths.profile}
                className="card text-left transition hover:border-orange-500 hover:bg-neutral-900/80"
              >
                <span className="font-medium text-neutral-200">{p.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20" id="workflow">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-xl font-bold text-white sm:text-2xl md:text-3xl">
            De votre CV à l&apos;entretien, en 4 étapes
          </h2>
          <p className="mt-3 text-center text-neutral-400">
            Chaque étape est automatisée. Vous gardez le contrôle, l&apos;IA fait le travail répétitif.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="card relative">
                <span className="mb-3 flex h-10 w-10 items-center justify-center bg-orange-500 text-lg font-bold text-black">
                  {s.n}
                </span>
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-neutral-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800 bg-neutral-950/50 px-4 py-20" id="features">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div className="card">
            <h3 className="text-xl font-bold text-white">Votre CV, noté et corrigé</h3>
            <p className="mt-2 text-neutral-400">
              Score sur 100. Suggestions concrètes. Red flags détectés. Vous savez quoi améliorer avant de candidater.
            </p>
            {user && (
              <Link to="/cv" className="mt-4 inline-block text-sm text-orange-400 hover:underline">
                Analyser mon CV →
              </Link>
            )}
          </div>
          <div className="card">
            <h3 className="text-xl font-bold text-white">Ciblez les bonnes entreprises</h3>
            <p className="mt-2 text-neutral-400">
              Secteur, ville, taille, effectifs. Filtres avancés et contacts RH pour chaque prospect.
            </p>
            {user && (
              <Link to="/companies" className="mt-4 inline-block text-sm text-orange-400 hover:underline">
                Voir les offres →
              </Link>
            )}
          </div>
          <div className="card md:col-span-2">
            <h3 className="text-xl font-bold text-white">Envoi & suivi</h3>
            <p className="mt-2 text-neutral-400">
              Générez des candidatures en lot, validez les lettres, planifiez l&apos;envoi et suivez les statuts jusqu&apos;à l&apos;entretien.
            </p>
            {user && (
              <Link to="/applications" className="mt-4 inline-block text-sm text-orange-400 hover:underline">
                Mes candidatures →
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800 px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-2xl font-bold text-white">Prêt à accélérer votre recherche ?</h2>
          <p className="mt-3 text-neutral-400">
            {user
              ? 'Reprenez là où vous vous êtes arrêté.'
              : 'Créez votre compte et lancez votre première campagne de candidatures.'}
          </p>
          <Link to={paths.bottomCta} className="btn-primary mt-8 inline-flex px-8 py-3">
            {paths.bottomCtaLabel}
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-800 px-4 py-8 text-center text-sm text-neutral-500">
        AI RH — Plateforme d&apos;automatisation des candidatures
      </footer>
    </main>
  );
}
