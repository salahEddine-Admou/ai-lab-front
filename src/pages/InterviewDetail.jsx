import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { PageLoader } from '../components/Loader';

const CATEGORY_LABELS = {
  motivation: 'Motivation',
  technique: 'Technique',
  experience: 'Expérience',
  'soft-skills': 'Soft skills',
  projection: 'Projection',
  closing: 'Clôture',
  presentation: 'Présentation',
  general: 'Général',
};

export default function InterviewDetail() {
  const { id } = useParams();
  const [simulation, setSimulation] = useState(null);
  const [openIndex, setOpenIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getInterview(id)
      .then(({ simulation: s }) => setSimulation(s))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="page-main max-w-3xl">
        <PageLoader label="Chargement de la simulation…" />
      </main>
    );
  }

  if (error || !simulation) {
    return (
      <main className="page-main max-w-3xl">
        <p className="text-red-400">{error || 'Simulation introuvable'}</p>
        <Link to="/interviews" className="btn-primary mt-4 inline-flex text-xs">
          Retour aux entretiens
        </Link>
      </main>
    );
  }

  const company = simulation.company;

  return (
    <main className="page-main max-w-3xl">
      <Link to="/interviews" className="text-sm text-orange-400 hover:underline">
        ← Mes entretiens
      </Link>

      <div className="card mt-6">
        <p className="text-sm text-orange-400">{company?.name}</p>
        <h1 className="mt-1 text-xl font-bold text-white break-words sm:text-2xl">{simulation.jobTitle}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {company?.city} · {company?.sector}
        </p>
        <p className="mt-4 text-lg font-semibold text-orange-400">
          Match profil : {simulation.matchScore}%
        </p>
        {simulation.matchReasons?.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            {simulation.matchReasons.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-white">
        Questions d&apos;entretien ({simulation.questions?.length || 0})
      </h2>

      <div className="mt-4 space-y-3">
        {simulation.questions?.map((q, i) => (
          <div key={q._id || i} className="card">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 text-left"
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            >
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-xs font-medium uppercase text-orange-400">
                  {CATEGORY_LABELS[q.category] || q.category}
                </span>
                <p className="mt-1 font-medium text-white">{q.question}</p>
              </div>
              <span className="text-neutral-500">{openIndex === i ? '−' : '+'}</span>
            </button>
            {openIndex === i && (
              <div className="mt-4 space-y-3 border-t border-neutral-800 pt-4 text-sm">
                {q.tip && (
                  <div>
                    <p className="font-medium text-neutral-300">Conseil</p>
                    <p className="mt-1 text-neutral-400">{q.tip}</p>
                  </div>
                )}
                {q.sampleAnswer && (
                  <div>
                    <p className="font-medium text-neutral-300">Exemple de réponse</p>
                    <p className="mt-1 text-neutral-400 whitespace-pre-wrap">{q.sampleAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
