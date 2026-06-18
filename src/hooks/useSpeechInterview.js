import { useCallback, useEffect, useRef, useState } from 'react';

function getRecognition() {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!R) return null;
  const r = new R();
  r.lang = 'fr-FR';
  r.continuous = true;
  r.interimResults = true;
  return r;
}

/** Indices voix / émotion légers pour le stand (sans ML lourd) */
export function useVoiceMetrics() {
  const [emotionHints, setEmotionHints] = useState([]);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const samplesRef = useRef([]);
  const rafRef = useRef(null);

  const startMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = { ctx, analyser };

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        samplesRef.current.push(avg);
        if (samplesRef.current.length > 120) samplesRef.current.shift();
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setEmotionHints(['micro non autorisé']);
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current?.ctx?.close?.();
    analyserRef.current = null;

    const s = samplesRef.current;
    if (s.length < 10) {
      setEmotionHints(['neutre']);
      samplesRef.current = [];
      return { avgVolume: 0, fillerCount: 0, wordsPerMinute: 0 };
    }
    const avg = s.reduce((a, b) => a + b, 0) / s.length;
    const variance =
      s.reduce((acc, v) => acc + (v - avg) ** 2, 0) / s.length;
    const hints = [];
    if (avg < 0.08) hints.push('hésitant', 'volume faible');
    else if (variance > 0.02) hints.push('stressé', 'variation forte');
    else if (avg > 0.2) hints.push('confiant', 'volume stable');
    else hints.push('calme', 'neutre');
    setEmotionHints(hints);
    samplesRef.current = [];
    return { avgVolume: Math.round(avg * 100) / 100 };
  }, []);

  return { emotionHints, startMonitoring, stopMonitoring };
}

export function useSpeechInterview() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const startTimeRef = useRef(0);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return Promise.resolve();
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR';
      u.rate = 0.95;
      const voices = window.speechSynthesis.getVoices();
      const fr = voices.find((v) => v.lang.startsWith('fr'));
      if (fr) u.voice = fr;
      setSpeaking(true);
      u.onend = () => {
        setSpeaking(false);
        resolve();
      };
      u.onerror = () => {
        setSpeaking(false);
        resolve();
      };
      window.speechSynthesis.speak(u);
    });
  }, []);

  const startListening = useCallback(() => {
    const rec = getRecognition();
    if (!rec) return false;
    setTranscript('');
    transcriptRef.current = '';
    startTimeRef.current = Date.now();
    recognitionRef.current = rec;
    rec.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      const trimmed = text.trim();
      transcriptRef.current = trimmed;
      setTranscript(trimmed);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
    return true;
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
    const durationSec = (Date.now() - startTimeRef.current) / 1000;
    return { transcript: transcriptRef.current, durationSec };
  }, []);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.abort?.();
    };
  }, []);

  return {
    listening,
    transcript,
    speaking,
    speak,
    startListening,
    stopListening,
    setTranscript,
  };
}
