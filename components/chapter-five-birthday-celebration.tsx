"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ChapterFiveConfig } from '@/data/story';

function normalizeMediaUrl(url: string) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return encodeURI(trimmed);
  }
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return encodeURI(withSlash);
}

function clampVolume(value: number) {
  if (Number.isNaN(value)) return 0.35;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

const MUSIC_FADE_MS = 900;

export default function ChapterFiveBirthdayCelebration({
  sectionId,
  registerRef,
  active,
  chapterFive,
  displayFont
}: {
  sectionId: string;
  registerRef: (id: string) => (node: HTMLElement | null) => void;
  active: boolean;
  chapterFive: ChapterFiveConfig;
  displayFont: string;
}) {
  const [blown, setBlown] = useState(false);
  const [cut, setCut] = useState(false);
  const [listening, setListening] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const celebrationRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number>(0);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micRafRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const candleCount = Math.max(1, Math.min(12, Number(chapterFive.candleCount) || 5));
  const candlePositions = useMemo(
    () => Array.from({ length: candleCount }).map((_, idx) => `${10 + (idx * 80) / Math.max(1, candleCount - 1)}%`),
    [candleCount]
  );

  function cancelFade() {
    if (fadeRafRef.current) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = 0;
    }
  }

  function fadeTo(audio: HTMLAudioElement, target: number, duration = MUSIC_FADE_MS, onEnd?: () => void) {
    cancelFade();
    const from = audio.volume;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 0.5 - Math.cos(t * Math.PI) / 2;
      audio.volume = from + (target - from) * eased;
      if (t < 1) {
        fadeRafRef.current = requestAnimationFrame(tick);
      } else {
        fadeRafRef.current = 0;
        if (onEnd) onEnd();
      }
    };

    fadeRafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio();
      bgMusicRef.current.loop = true;
      bgMusicRef.current.preload = 'auto';
    }
    if (!celebrationRef.current) {
      celebrationRef.current = new Audio();
      celebrationRef.current.preload = 'auto';
    }

    const music = bgMusicRef.current;
    const sfx = celebrationRef.current;
    const musicSrc = normalizeMediaUrl(chapterFive.backgroundMusicSrc);
    const sfxSrc = normalizeMediaUrl(chapterFive.celebrationSoundSrc);

    if (musicSrc) {
      if (music.src !== new URL(musicSrc, window.location.origin).toString()) {
        music.src = musicSrc;
        music.currentTime = 0;
        music.volume = 0;
      }
      const target = clampVolume(0.35);
      if (active) {
        music.play()
          .then(() => fadeTo(music, target))
          .catch(() => {
            /* ignore autoplay block */
          });
      } else {
        fadeTo(music, 0, MUSIC_FADE_MS, () => {
          music.pause();
          music.currentTime = 0;
        });
      }
    }

    if (sfxSrc) {
      sfx.src = sfxSrc;
      sfx.volume = clampVolume(0.8);
    }
  }, [active, chapterFive.backgroundMusicSrc, chapterFive.celebrationSoundSrc]);

  useEffect(
    () => () => {
      cancelFade();
    },
    []
  );

  useEffect(() => {
    if (active) return;
    setBlown(false);
    setCut(false);
    setListening(false);
    setConfettiBurst(false);
  }, [active]);

  useEffect(() => {
    if (!chapterFive.micEnabled || !listening || blown || !active) return;
    let stopped = false;

    async function startMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        micStreamRef.current = stream;
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i += 1) {
            const centered = (data[i] - 128) / 128;
            sum += centered * centered;
          }
          const rms = Math.sqrt(sum / data.length);
          if (rms > 0.16) {
            triggerBlow();
            return;
          }
          micRafRef.current = requestAnimationFrame(tick);
        };
        micRafRef.current = requestAnimationFrame(tick);
      } catch {
        setListening(false);
      }
    }

    startMic();

    return () => {
      stopped = true;
      cancelAnimationFrame(micRafRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [listening, chapterFive.micEnabled, blown, active]);

  function triggerBlow() {
    if (blown) return;
    setBlown(true);
    setListening(false);
    celebrationRef.current?.play().catch(() => {});
    setConfettiBurst(true);
    setTimeout(() => setConfettiBurst(false), 2400);
  }

  return (
    <section id={sectionId} ref={registerRef(sectionId)} className="memory-section relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-14 md:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,213,162,0.28),transparent_44%),radial-gradient(circle_at_20%_80%,rgba(255,166,133,0.16),transparent_48%),radial-gradient(circle_at_80%_80%,rgba(255,230,160,0.18),transparent_48%)]" />
      <div className="relative z-20 mx-auto w-full max-w-5xl text-center">
        <p className="mt-2 text-2xl md:text-3xl" style={{ color: '#fff5e6', fontFamily: displayFont }}>
          {chapterFive.wishText}
        </p>

        <div className="relative mx-auto mt-10 h-[340px] w-[290px] md:h-[420px] md:w-[360px]">
          <div className="absolute left-1/2 top-[56px] z-30 h-12 w-[86%] -translate-x-1/2">
            {candlePositions.map((left, idx) => (
              <div key={`candle-${idx}`} className="absolute top-1 h-12 w-2 -translate-x-1/2 rounded bg-[#ffe3b8]" style={{ left }}>
                <AnimatePresence>
                  {!blown && (
                    <motion.span
                      className="absolute -top-4 left-1/2 h-4 w-3 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#fff7a8] via-[#ffb154] to-[#ff7e38] shadow-[0_0_18px_rgba(255,186,94,0.9)]"
                      initial={{ opacity: 0.9, scale: 1 }}
                      animate={{ opacity: [0.65, 1, 0.75], scale: [0.96, 1.08, 0.94], y: [0, -1, 0] }}
                      exit={{ opacity: 0, scale: 0.2 }}
                      transition={{ duration: 0.7 + idx * 0.04, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </AnimatePresence>
                {blown ? (
                  <motion.span
                    className="absolute -top-6 left-1/2 h-5 w-4 -translate-x-1/2 rounded-full bg-white/40 blur-[2px]"
                    initial={{ opacity: 0.7, y: 0 }}
                    animate={{ opacity: [0.6, 0], y: [-2, -22], x: [0, idx % 2 === 0 ? -6 : 6] }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <motion.div
            className="absolute inset-x-0 bottom-0 mx-auto h-[260px] w-full overflow-hidden rounded-[36px] border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            animate={cut ? { scale: 1.02 } : { scale: 1 }}
          >
            <motion.div className="absolute left-0 top-0 h-full w-1/2 origin-right overflow-hidden" animate={cut ? { rotate: -18, x: -26 } : { rotate: 0, x: 0 }}>
              <img src={normalizeMediaUrl(chapterFive.cakeImageSrc)} alt="Cake left" className="h-full w-[200%] object-cover object-left" />
            </motion.div>
            <motion.div className="absolute right-0 top-0 h-full w-1/2 origin-left overflow-hidden" animate={cut ? { rotate: 18, x: 26 } : { rotate: 0, x: 0 }}>
              <img src={normalizeMediaUrl(chapterFive.cakeImageSrc)} alt="Cake right" className="h-full w-[200%] object-cover object-right" />
            </motion.div>
            <AnimatePresence>
              {cut && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center px-4 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="max-w-[82%] rounded-2xl bg-black/55 px-4 py-3 text-sm text-[#ffeccc] md:text-base">{chapterFive.hiddenBirthdayMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {!blown ? (
            <>
              <button type="button" onClick={triggerBlow} className="rounded-full border border-white/30 bg-white/10 px-6 py-2 text-sm text-white hover:bg-white/20">
                Blow the Candles
              </button>
              {chapterFive.micEnabled ? (
                <button
                  type="button"
                  onClick={() => setListening((prev) => !prev)}
                  className="rounded-full border border-white/30 bg-black/25 px-6 py-2 text-sm text-white hover:bg-white/10"
                >
                  {listening ? 'Stop Mic' : 'Use Microphone'}
                </button>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCut(true)}
              disabled={cut}
              className="rounded-full border border-white/30 bg-white/10 px-6 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-50"
            >
              {cut ? 'Cake Cut' : 'Cut the Cake'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {confettiBurst && (
          <div className="pointer-events-none fixed inset-0 z-[90]">
            {Array.from({ length: 90 }).map((_, idx) => (
              <motion.span
                key={`confetti-${idx}`}
                className="absolute h-2 w-2 rounded-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${-10 - Math.random() * 20}%`,
                  backgroundColor: ['#ffd86f', '#ff8db3', '#9ee8ff', '#b9ff9a'][idx % 4]
                }}
                initial={{ y: -40, rotate: 0, opacity: 1 }}
                animate={{ y: '115vh', rotate: 480, opacity: [1, 1, 0.7] }}
                transition={{ duration: 2 + Math.random() * 1.8, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
