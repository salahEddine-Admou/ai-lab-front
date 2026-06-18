import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { standApi } from '../../api/standApi';
import { PageLoader } from '../../components/Loader';

export default function StandReportPage() {
  const { token } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    standApi
      .getReport(token)
      .then((d) => setReport(d.report))
      .catch((e) => setError(e.message));
  }, [token]);

  if (error) {
    return (
      <div className="page-main text-center">
        <p className="text-red-400">{error}</p>
        <Link to="/parcours" className="btn-primary mt-6 inline-flex">
          Nouveau parcours
        </Link>
      </div>
    );
  }

  if (!report) return <PageLoader label="Chargement du rapport…" />;

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-neutral-800 py-6">
        <div className="page-container">
          <p className="text-xs uppercase tracking-widest text-orange-500">AI RH — Rapport</p>
          <h1 className="page-title mt-1">
            {report.firstName ? `Bonjour ${report.firstName}` : 'Votre bilan emploi'}
          </h1>
          <p className="mt-2 text-sm text-neutral-400">{report.reportSummary}</p>
        </div>
      </header>

      <div className="page-main space-y-8">
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold text-white">CV</h2>
          <p className="text-3xl font-bold text-orange-400">{report.cvScore ?? '—'}/100</p>
          <ul className="mt-3 list-inside list-disc text-sm text-neutral-400">
            {(report.cvFeedback || []).slice(0, 5).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="mb-3 text-lg font-semibold text-white">Offres compatibles</h2>
          <ul className="space-y-3">
            {(report.matchedOffers || []).map((o, i) => (
              <li key={i} className="border border-neutral-800 p-3">
                <p className="font-medium text-white">{o.name}</p>
                <p className="text-sm text-neutral-400">
                  {o.jobTitle} · {o.city} — {o.matchScore}%
                </p>
              </li>
            ))}
          </ul>
        </section>

        {report.interview?.overallScore != null && (
          <section className="card">
            <h2 className="mb-3 text-lg font-semibold text-white">Entretien simulé</h2>
            <p className="text-2xl font-bold text-orange-400">{report.interview.overallScore}/100</p>
            <p className="text-sm text-neutral-400">{report.interview.overallFeedback}</p>
          </section>
        )}

        <section className="card">
          <h2 className="mb-3 text-lg font-semibold text-white">Formations recommandées</h2>
          <ul className="space-y-4">
            {(report.trainings || []).map((t, i) => (
              <li key={i} className="border-l-2 border-orange-500 pl-4">
                <p className="font-medium text-white">{t.title}</p>
                <p className="text-sm text-neutral-400">{t.description}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {t.provider} · {t.duration} · priorité {t.priority}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-center text-xs text-neutral-600">
          Généré par AI RH — Orange Digital Center Agadir
        </p>
      </div>
    </div>
  );
}
