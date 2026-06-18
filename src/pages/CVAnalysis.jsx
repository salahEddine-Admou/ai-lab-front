import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { triggerDownload } from '../utils/downloadFile';
import { ActionOverlay, LoadingButton } from '../components/Loader';

const ACCEPT = '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

const PRIORITY_STYLES = {
  high: 'text-red-400 border-red-500/30',
  medium: 'text-amber-400 border-amber-500/30',
  low: 'text-neutral-400 border-neutral-700',
};

export default function CVAnalysis() {
  const { user, refreshUser } = useAuth();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysis, setAnalysis] = useState(
    user?.cvScore != null
      ? { score: user.cvScore, feedback: user.cvFeedback, suggestedSectors: user.targetSectors }
      : null
  );
  const [adaptation, setAdaptation] = useState(null);
  const [tab, setTab] = useState('analyze');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [editedCv, setEditedCv] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState('');
  const [overlayLabel, setOverlayLabel] = useState('');

  const overlayBusy = loading || adapting || saving || !!downloading;

  useEffect(() => {
    api
      .getCvAdaptation()
      .then(({ adaptation: a }) => {
        if (a) {
          setAdaptation(a);
          setEditedCv(a.adaptedCvText || '');
        } else if (user?.cvAdaptedText) {
          setEditedCv(user.cvAdaptedText);
        }
      })
      .catch(() => {});
  }, [user?.cvAdaptedText]);

  const pickFile = (f) => {
    if (!f) return;
    const ext = f.name.toLowerCase();
    if (!/\.(pdf|docx|txt)$/.test(ext)) {
      setError('Format accepté : PDF, DOCX ou TXT');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 5 Mo)');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Sélectionnez un fichier CV');
      return;
    }
    setError('');
    setOverlayLabel('Analyse de votre CV par IA…');
    setLoading(true);
    try {
      const data = await api.analyzeCVUpload(file);
      setAnalysis(data.analysis);
      setUploadedFileName(data.fileName || file.name);
      await refreshUser();
      try {
        await api.syncInterviews(2);
      } catch {
        /* optional */
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdapt = async () => {
    setError('');
    setOverlayLabel('Adaptation du CV à vos offres matchées…');
    setAdapting(true);
    try {
      const data = await api.adaptCv();
      setAdaptation(data.adaptation);
      setEditedCv(data.adaptation.adaptedCvText || '');
      await refreshUser();
      setTab('adapted');
    } catch (err) {
      setError(err.message);
    } finally {
      setAdapting(false);
    }
  };

  const copyAdaptedCv = async () => {
    if (!editedCv.trim()) return;
    await navigator.clipboard.writeText(editedCv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCv = async () => {
    if (!editedCv.trim()) {
      setError('Le CV est vide');
      return;
    }
    setError('');
    setOverlayLabel('Enregistrement du CV…');
    setSaving(true);
    setSaved(false);
    try {
      await api.saveAdaptedCv(editedCv);
      await refreshUser();
      if (adaptation) {
        setAdaptation({ ...adaptation, adaptedCvText: editedCv });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (format) => {
    setError('');
    setOverlayLabel('Préparation du téléchargement…');
    setDownloading(format);
    try {
      if (editedCv.trim() && editedCv !== (user?.cvAdaptedText || adaptation?.adaptedCvText)) {
        await api.saveAdaptedCv(editedCv);
        await refreshUser();
      }
      const { blob, filename } = await api.downloadCv(format);
      triggerDownload(blob, filename);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading('');
    }
  };

  const scoreColor = (score) =>
    score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';

  const displayScore = analysis?.score ?? user?.cvScore;
  const adaptedScore = adaptation?.scoreAfter ?? user?.cvAdaptedScore;

  return (
    <main className="page-main max-w-5xl">
      <ActionOverlay
        show={overlayBusy}
        label={overlayLabel || 'Traitement en cours…'}
      />
      <h1 className="page-title">Analyse & optimisation CV</h1>
      <p className="mt-1 text-sm text-neutral-400 sm:text-base">
        Importez votre CV, puis corrigez-le et adaptez-le aux postes qui correspondent à votre profil
      </p>

      <div className="tabs-scroll mt-6">
        <button
          type="button"
          className={`tab-btn ${tab === 'analyze' ? 'border-b-2 border-orange-500 text-orange-400' : 'text-neutral-500'}`}
          onClick={() => setTab('analyze')}
        >
          Analyse
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === 'adapted' ? 'border-b-2 border-orange-500 text-orange-400' : 'text-neutral-500'}`}
          onClick={() => setTab('adapted')}
          disabled={!adaptation && !user?.cvAdaptedText}
        >
          CV corrigé & adapté
        </button>
      </div>

      {tab === 'analyze' && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-2">
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center border-2 border-dashed px-4 py-6 text-center transition sm:min-h-[260px] sm:px-6 ${
                dragOver
                  ? 'border-orange-500 bg-orange-950/20'
                  : 'border-neutral-700 bg-neutral-950 hover:border-orange-500/50'
              }`}
            >
              <span className="text-4xl">📄</span>
              <p className="mt-4 font-medium text-white">
                Glissez votre CV ici ou cliquez pour parcourir
              </p>
              <p className="mt-2 text-sm text-neutral-500">PDF, DOCX, TXT — max 5 Mo</p>
              {file && (
                <p className="mt-4 border border-orange-500/30 bg-black px-4 py-2 text-sm text-orange-300">
                  {file.name} ({(file.size / 1024).toFixed(0)} Ko)
                </p>
              )}
            </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {file && (
              <button
                type="button"
                className="btn-secondary w-full text-xs sm:w-auto"
                  onClick={() => {
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                >
                  Changer de fichier
                </button>
              )}
            <LoadingButton
              className="btn-primary w-full sm:w-auto"
              onClick={handleAnalyze}
              loading={loading}
              loadingLabel="Analyse IA…"
              disabled={!file || adapting}
            >
              Analyser mon CV
            </LoadingButton>
          </div>

            {(user?.cvText || displayScore != null) && (
              <LoadingButton
                className="btn-secondary w-full text-xs"
                onClick={handleAdapt}
                loading={adapting}
                loadingLabel="Adaptation…"
                disabled={loading}
              >
                Corriger et adapter aux postes correspondants
              </LoadingButton>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div className="space-y-4">
            {displayScore != null ? (
              <>
                <div className="card text-center">
                  <p className="text-sm text-neutral-500">Score actuel</p>
                  <p className={`text-5xl font-extrabold sm:text-6xl ${scoreColor(displayScore)}`}>
                    {displayScore}
                    <span className="text-2xl text-neutral-500">/100</span>
                  </p>
                  {adaptedScore != null && (
                    <p className="mt-2 text-sm text-orange-400">
                      Score projeté après adaptation : {adaptedScore}/100
                    </p>
                  )}
                </div>
                <div className="card">
                  <h3 className="font-semibold text-white">Suggestions</h3>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                    {(analysis?.feedback || user?.cvFeedback || []).map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="card flex min-h-[200px] items-center justify-center text-neutral-500">
                Importez un CV pour commencer
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'adapted' && (
        <div className="mt-8 space-y-6">
          {!adaptation && !user?.cvAdaptedText ? (
            <div className="card text-center text-neutral-500">
              <p>Analysez votre CV puis cliquez sur « Corriger et adapter aux postes correspondants ».</p>
              <button type="button" className="btn-primary mt-4 text-xs" onClick={() => setTab('analyze')}>
                Retour à l&apos;analyse
              </button>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-white">CV optimisé pour vos matchs</h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      {adaptation?.summary || user?.cvAdaptationSummary}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-4 text-center sm:gap-2">
                    <div>
                      <p className="text-xs text-neutral-500">Avant</p>
                      <p className={`text-xl font-bold ${scoreColor(adaptation?.scoreBefore ?? user?.cvScore ?? 0)}`}>
                        {adaptation?.scoreBefore ?? user?.cvScore ?? '—'}
                      </p>
                    </div>
                    <span className="self-center text-orange-400">→</span>
                    <div>
                      <p className="text-xs text-neutral-500">Après</p>
                      <p className={`text-xl font-bold ${scoreColor(adaptedScore ?? 0)}`}>
                        {adaptedScore ?? '—'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
                  <LoadingButton
                    className="btn-primary w-full text-xs sm:w-auto"
                    onClick={handleSaveCv}
                    loading={saving}
                    loadingLabel="Enregistrement…"
                    disabled={!editedCv.trim() || !!downloading}
                  >
                    {saved ? 'Enregistré ✓' : 'Enregistrer'}
                  </LoadingButton>
                  <LoadingButton
                    className="btn-secondary w-full text-xs sm:w-auto"
                    onClick={() => handleDownload('txt')}
                    loading={downloading === 'txt'}
                    loadingLabel="Téléchargement…"
                    disabled={!editedCv.trim() || !!downloading}
                  >
                    Télécharger .txt
                  </LoadingButton>
                  <LoadingButton
                    className="btn-secondary w-full text-xs sm:w-auto"
                    onClick={() => handleDownload('docx')}
                    loading={downloading === 'docx'}
                    loadingLabel="Téléchargement…"
                    disabled={!editedCv.trim() || !!downloading}
                  >
                    Télécharger .docx
                  </LoadingButton>
                  <button type="button" className="btn-secondary w-full text-xs sm:w-auto" onClick={copyAdaptedCv}>
                    {copied ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              </div>

              {(adaptation?.fixes?.length > 0 || user?.cvFixes?.length > 0) && (
                <div className="card">
                  <h3 className="font-semibold text-white">Corrections appliquées</h3>
                  <ul className="mt-4 space-y-3">
                    {(adaptation?.fixes || user?.cvFixes || []).map((f, i) => (
                      <li
                        key={i}
                        className={`border-l-2 pl-3 text-sm ${PRIORITY_STYLES[f.priority] || PRIORITY_STYLES.medium}`}
                      >
                        <p className="font-medium text-white">{f.issue}</p>
                        <p className="mt-1 text-neutral-400">{f.suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {adaptation?.jobTargets?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-white">Adapté pour ces postes</h3>
                  <div className="mt-4 space-y-3">
                    {adaptation.jobTargets.map((j, i) => (
                      <div
                        key={i}
                        className="border border-neutral-800 bg-black p-4"
                      >
                        <div className="flex flex-wrap justify-between gap-2">
                          <div>
                            <p className="font-medium text-white">{j.companyName}</p>
                            <p className="text-sm text-orange-400">{j.suggestedRole}</p>
                          </div>
                          <span className="text-lg font-bold text-orange-400">{j.matchScore}%</span>
                        </div>
                        {j.keywordsAdded?.length > 0 && (
                          <p className="mt-2 text-xs text-neutral-500">
                            Mots-clés : {j.keywordsAdded.join(', ')}
                          </p>
                        )}
                        {j.sectionTips && (
                          <p className="mt-2 text-sm text-neutral-400">{j.sectionTips}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <Link to="/dashboard" className="btn-secondary mt-4 inline-flex text-xs">
                    Voir le tableau de bord →
                  </Link>
                </div>
              )}

              <div className="card">
                <h3 className="font-semibold text-white">Texte du CV adapté</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Modifiez si besoin, puis enregistrez ou téléchargez
                </p>
                <textarea
                  className="input mt-4 min-h-[280px] font-mono text-xs leading-relaxed sm:min-h-[400px]"
                  value={editedCv}
                  onChange={(e) => {
                    setEditedCv(e.target.value);
                    setSaved(false);
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
