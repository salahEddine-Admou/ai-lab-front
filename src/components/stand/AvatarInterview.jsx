import { useEffect, useRef, useState } from 'react';
import AvatarFace from './AvatarFace';
import { useSpeechInterview, useVoiceMetrics } from '../../hooks/useSpeechInterview';
import { standApi } from '../../api/standApi';
import { ActionOverlay, LoadingButton } from '../Loader';

function countFillers(text) {
  const fillers = ['euh', 'hum', 'ben', 'bah', 'genre', 'en fait'];
  let n = 0;
  const lower = text.toLowerCase();
  for (const f of fillers) {
    n += (lower.match(new RegExp(`\\b${f}\\b`, 'gi')) || []).length;
  }
  return n;
}

export default function AvatarInterview({ token, interview, onComplete }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('intro');
  const [lastEval, setLastEval] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    if (!cameraOn || !videoRef.current) return;
    let stream;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {});
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [cameraOn]);

  const { speaking, transcript, listening, speak, startListening, stopListening, setTranscript } =
    useSpeechInterview();
  const { emotionHints, startMonitoring, stopMonitoring } = useVoiceMetrics();

  const questions = interview?.questions || [];
  const current = questions[index];

  useEffect(() => {
    if (phase === 'ask' && current) {
      speak(current.question).then(() => {
        setPhase('listen');
      });
    }
  }, [phase, index, current, speak]);

  const handleStartAnswer = async () => {
    setTranscript('');
    setLastEval(null);
    await startMonitoring();
    const ok = startListening();
    if (!ok) {
      alert('Reconnaissance vocale non supportée sur ce navigateur. Utilisez Chrome/Edge.');
    }
  };

  const handleStopAnswer = async () => {
    const { transcript: finalText, durationSec } = stopListening();
    const voiceBase = stopMonitoring();
    const words = finalText.trim().split(/\s+/).filter(Boolean).length;
    const wpm = durationSec > 0 ? Math.round((words / durationSec) * 60) : 0;
    const voiceMetrics = {
      ...voiceBase,
      wordsPerMinute: wpm,
      fillerCount: countFillers(finalText),
    };

    setOverlay(true);
    setLoading(true);
    try {
      const { evaluation } = await standApi.submitAnswer(token, {
        questionIndex: index,
        transcript: finalText,
        durationSec,
        voiceMetrics,
        emotionHints,
      });
      setLastEval(evaluation);
      setPhase('feedback');
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
      setOverlay(false);
    }
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
    setLastEval(null);
    setPhase('ask');
  };

  if (!questions.length) {
    return <p className="text-neutral-400">Aucune question d&apos;entretien.</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ActionOverlay show={overlay} label="Analyse voix & réponse…" />
      <div className="flex flex-col items-center gap-4">
        <AvatarFace speaking={speaking} mood={lastEval?.tone === 'hésitant' ? 'stress' : 'neutral'} />
        {cameraOn && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-24 w-32 border border-neutral-700 object-cover"
          />
        )}
        <label className="flex items-center gap-2 text-xs text-neutral-500">
          <input
            type="checkbox"
            checked={cameraOn}
            onChange={(e) => setCameraOn(e.target.checked)}
          />
          Caméra (indices émotion visuels)
        </label>
      </div>

      <div className="card flex flex-col gap-4">
        <p className="text-xs uppercase tracking-wider text-orange-500">
          {interview.companyName} — {interview.jobTitle}
        </p>
        <p className="text-sm text-neutral-500">
          Question {index + 1} / {questions.length}
        </p>
        <h2 className="text-lg font-semibold text-white">{current?.question}</h2>
        {current?.tip && (
          <p className="border-l-2 border-orange-500/50 pl-3 text-sm text-neutral-400">
            Conseil : {current.tip}
          </p>
        )}

        {phase === 'listen' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-orange-300">
              {listening ? (
                <div className="flex h-3 items-end justify-center gap-0.5" aria-hidden>
                  <span className="w-0.5 bg-current opacity-70 animate-[loader-bar_0.8s_ease-in-out_infinite]" />
                  <span className="w-0.5 bg-current opacity-70 animate-[loader-bar_0.8s_ease-in-out_infinite_0.1s]" />
                  <span className="w-0.5 bg-current opacity-70 animate-[loader-bar_0.8s_ease-in-out_infinite_0.2s]" />
                </div>
              ) : null}
              <span>{listening ? 'Parlez maintenant…' : 'Appuyez pour répondre à voix haute'}</span>
            </div>
            <div className="min-h-[80px] border border-neutral-800 bg-black p-3 text-sm text-neutral-300">
              {transcript || '— transcription en direct —'}
            </div>
            {!listening ? (
              <LoadingButton type="button" onClick={handleStartAnswer} className="btn-primary w-full">
                🎤 Répondre à l&apos;oral
              </LoadingButton>
            ) : (
              <LoadingButton
                type="button"
                loading={loading}
                loadingLabel="Analyse…"
                onClick={handleStopAnswer}
                className="btn-primary w-full"
              >
                Terminer ma réponse
              </LoadingButton>
            )}
          </div>
        )}

        {phase === 'feedback' && lastEval && (
          <div className="space-y-3 border border-orange-500/30 bg-orange-500/5 p-4">
            <p className="text-sm">
              Score : <strong className="text-orange-400">{lastEval.score}/100</strong> — Ton :{' '}
              {lastEval.tone}
            </p>
            <p className="text-sm text-neutral-300">{lastEval.feedback}</p>
            {emotionHints.length > 0 && (
              <p className="text-xs text-neutral-500">
                Indices détectés : {emotionHints.join(', ')}
              </p>
            )}
            <button type="button" className="btn-primary w-full" onClick={handleNext}>
              {index + 1 >= questions.length ? 'Voir mon rapport' : 'Question suivante'}
            </button>
          </div>
        )}

        {phase === 'intro' && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setPhase('ask')}
          >
            Démarrer l&apos;entretien avec l&apos;avatar
          </button>
        )}
      </div>
    </div>
  );
}
