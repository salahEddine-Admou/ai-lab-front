import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import StandLayout from '../../components/stand/StandLayout';
import JourneyProgress from '../../components/stand/JourneyProgress';
import AvatarInterview from '../../components/stand/AvatarInterview';
import { standApi } from '../../api/standApi';
import { ActionOverlay, LoadingButton, PageLoader } from '../../components/Loader';

const STORAGE_KEY = 'ai-rh-stand-token';
const PROFILE_TYPES = [
  { value: 'emploi', label: 'Emploi' },
  { value: 'stage', label: 'Stage' },
  { value: 'alternance', label: 'Alternance' },
  { value: 'freelance', label: 'Freelance' },
];

export default function StandJourney() {
  const navigate = useNavigate();
  const [step, setStep] = useState('welcome');
  const [token, setToken] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);
  const [overlay, setOverlay] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [interview, setInterview] = useState(null);
  const [cvStats, setCvStats] = useState(0);

  const [form, setForm] = useState({
    firstName: '',
    profileType: 'emploi',
    targetLocation: 'Casablanca',
  });

  const persistToken = useCallback((t) => {
    setToken(t);
    if (t) sessionStorage.setItem(STORAGE_KEY, t);
    else sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const startSession = async () => {
    setOverlay(true);
    try {
      const data = await standApi.createSession(form);
      persistToken(data.token);
      setSession(data.session);
      setStep('profile');
    } catch (e) {
      alert(e.message);
    } finally {
      setOverlay(false);
    }
  };

  const saveProfile = async () => {
    if (!token) return startSession();
    setOverlay(true);
    try {
      const { session: s } = await standApi.updateProfile(token, { ...form, step: 'cv' });
      setSession(s);
      setStep('cv');
    } catch (e) {
      alert(e.message);
    } finally {
      setOverlay(false);
    }
  };

  const uploadCv = async () => {
    if (!cvFile) return alert('Choisissez un fichier CV');
    setOverlay(true);
    try {
      const data = await standApi.analyzeCv(token, cvFile);
      setSession(data.session);
      setStep('cv-result');
    } catch (e) {
      alert(e.message);
    } finally {
      setOverlay(false);
    }
  };

  const loadMatches = async () => {
    setOverlay(true);
    try {
      const data = await standApi.getMatches(token);
      setSession(data.session);
      setStep('offers');
    } catch (e) {
      alert(e.message);
    } finally {
      setOverlay(false);
    }
  };

  const startInterview = async () => {
    setOverlay(true);
    try {
      const data = await standApi.startInterview(token);
      setInterview(data.interview);
      setStep('interview');
    } catch (e) {
      alert(e.message);
    } finally {
      setOverlay(false);
    }
  };

  const finishInterview = async () => {
    setOverlay(true);
    try {
      const data = await standApi.finalize(token);
      setReport(data.report);
      setSession(data.session);
      setStep('report');
    } catch (e) {
      alert(e.message);
    } finally {
      setOverlay(false);
    }
  };

  useEffect(() => {
    if (step !== 'report' || !token) return;
    const url = `${window.location.origin}/rapport/${token}`;
    QRCode.toDataURL(url, { width: 280, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [step, token]);

  useEffect(() => {
    if (step === 'welcome') {
      standApi.getStats()
        .then(data => setCvStats(data.cvCount || 0))
        .catch(console.error);
    }
  }, [step]);

  const purgeAndRestart = async () => {
    setOverlay(true);
    try {
      if (token) await standApi.purgeSession(token);
    } catch {
      /* ignore */
    }
    persistToken('');
    setSession(null);
    setReport(null);
    setInterview(null);
    setCvFile(null);
    setQrDataUrl('');
    setStep('welcome');
    setForm({ firstName: '', profileType: 'emploi', targetLocation: 'Casablanca' });
    navigate('/parcours', { replace: true });
    setOverlay(false);
  };

  const stepLabels = {
    welcome: 'Bienvenue',
    profile: 'Votre profil',
    cv: 'Analyse CV',
    'cv-result': 'Résultat CV',
    offers: 'Offres matchées',
    'interview-intro': 'Entretien IA',
    interview: 'Simulation',
    report: 'Rapport & QR',
  };

  return (
    <StandLayout stepLabel={stepLabels[step]}>
      <ActionOverlay show={overlay} />
      <div className="page-main max-w-4xl">
        <JourneyProgress currentStep={step} />

        {step === 'welcome' && (
          <section className="card text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-500">Parcours sans compte</p>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Votre parcours emploi en quelques minutes
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-neutral-400">
              Profil → CV → offres adaptées → entretien avec avatar (voix & émotion) → rapport QR.
              Aucune inscription : vos données sont effacées à la fin.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" className="btn-primary min-w-[200px]" onClick={startSession}>
                Commencer le parcours
              </button>
            </div>
            {cvStats > 0 && (
              <p className="mt-8 text-sm text-neutral-500">
                <span className="font-bold text-orange-500">{cvStats}</span> CV(s) analysé(s) aujourd&apos;hui
              </p>
            )}
          </section>
        )}

        {step === 'profile' && (
          <section className="card space-y-4">
            <h2 className="page-title">Qui êtes-vous ?</h2>
            <div>
              <label className="label">Prénom (optionnel)</label>
              <input
                className="input"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder="Ex. Sara"
              />
            </div>
            <div>
              <label className="label">Type de recherche</label>
              <select
                className="input"
                value={form.profileType}
                onChange={(e) => setForm((f) => ({ ...f, profileType: e.target.value }))}
              >
                {PROFILE_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ville cible</label>
              <input
                className="input"
                value={form.targetLocation}
                onChange={(e) => setForm((f) => ({ ...f, targetLocation: e.target.value }))}
              />
            </div>
            <LoadingButton loading={overlay} onClick={saveProfile} className="btn-primary">
              Continuer vers le CV
            </LoadingButton>
          </section>
        )}

        {step === 'cv' && (
          <section className="card space-y-4">
            <h2 className="page-title">Déposez votre CV</h2>
            <p className="text-sm text-neutral-400">PDF, DOCX ou TXT — analyse IA instantanée.</p>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="input file:mr-4 file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-black"
              onChange={(e) => setCvFile(e.target.files?.[0])}
            />
            <LoadingButton loading={overlay} onClick={uploadCv} className="btn-primary">
              Analyser mon CV
            </LoadingButton>
          </section>
        )}

        {step === 'cv-result' && (
          <section className="card space-y-4">
            <h2 className="page-title">Score CV</h2>
            <p className="text-4xl font-bold text-orange-400">{session?.cvScore ?? '—'}/100</p>
            <ul className="list-inside list-disc text-sm text-neutral-400">
              {(session?.cvFeedback || []).slice(0, 6).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <LoadingButton loading={overlay} onClick={loadMatches} className="btn-primary">
              Voir mes offres compatibles
            </LoadingButton>
          </section>
        )}

        {step === 'offers' && (
          <section className="space-y-4">
            <h2 className="page-title">Offres pour vous</h2>
            <ul className="space-y-3">
              {(session?.matchedOffers || []).map((o, i) => (
                <li key={i} className="card">
                  <p className="font-semibold text-white">{o.name}</p>
                  <p className="text-sm text-neutral-400">
                    {o.jobTitle} · {o.sector} · {o.city}
                  </p>
                  <p className="mt-2 text-orange-400">{o.matchScore}% compatible</p>
                </li>
              ))}
            </ul>
            <button type="button" className="btn-primary" onClick={() => setStep('interview-intro')}>
              Passer à l&apos;entretien simulé
            </button>
          </section>
        )}

        {step === 'interview-intro' && (
          <section className="card space-y-4 text-center">
            <h2 className="page-title">Entretien avec avatar IA</h2>
            <p className="text-neutral-400">
              Un coach virtuel vous pose des questions à l&apos;oral. Nous analysons votre voix,
              votre ton et (optionnel) la caméra pour un feedback immédiat.
            </p>
            <p className="text-sm text-orange-300/90">
              Autorisez le micro dans le navigateur. Chrome ou Edge recommandé.
            </p>
            <LoadingButton loading={overlay} onClick={startInterview} className="btn-primary mx-auto">
              Lancer la simulation
            </LoadingButton>
          </section>
        )}

        {step === 'interview' && interview && (
          <AvatarInterview token={token} interview={interview} onComplete={finishInterview} />
        )}

        {step === 'report' && report && (
          <section className="space-y-6">
            <div className="card text-center">
              <h2 className="page-title">Votre rapport est prêt</h2>
              <p className="mt-2 text-sm text-neutral-400">{report.reportSummary}</p>
              <div className="mx-auto mt-6 inline-block border-4 border-orange-500 bg-white p-2">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR code rapport" width={280} height={280} />
                ) : (
                  <PageLoader label="QR…" />
                )}
              </div>
              <p className="mt-4 text-xs text-neutral-500">
                Scannez pour ouvrir le rapport sur votre téléphone
              </p>
              <p className="mt-1 break-all text-xs text-orange-400/80">
                {window.location.origin}/rapport/{token}
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold text-white">Résumé rapide</h3>
              <p className="mt-2 text-sm text-neutral-400">
                CV {report.cvScore}/100 · Entretien {report.interview?.overallScore ?? '—'}/100 ·{' '}
                {report.matchedOffers?.length || 0} offres
              </p>
              <h4 className="mt-4 text-sm font-medium text-orange-400">Formations suggérées</h4>
              <ul className="mt-2 space-y-2 text-sm text-neutral-400">
                {(report.trainings || []).slice(0, 3).map((t, i) => (
                  <li key={i}>
                    <strong className="text-neutral-200">{t.title}</strong> — {t.duration}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" className="btn-primary" onClick={purgeAndRestart}>
                Nouveau visiteur (effacer tout)
              </button>
            </div>
            <p className="text-center text-xs text-neutral-600">
              En cliquant ci-dessus, toutes les données de cette session sont supprimées du stand.
            </p>
          </section>
        )}
      </div>
    </StandLayout>
  );
}
