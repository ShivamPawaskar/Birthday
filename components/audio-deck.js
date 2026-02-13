"use client";

import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';

const FADE_DURATION_MS = 1200;
const STEP_MS = 60;
const barPatterns = [
  ['22%', '66%', '34%', '70%', '28%'],
  ['44%', '82%', '38%', '74%', '30%'],
  ['28%', '62%', '84%', '42%', '24%'],
  ['48%', '30%', '72%', '32%', '64%']
];

function fadeVolume(audio, from, to, duration, timersRef) {
  if (!audio) return;
  const steps = Math.max(1, Math.floor(duration / STEP_MS));
  let currentStep = 0;
  audio.volume = from;

  const timer = setInterval(() => {
    currentStep += 1;
    const progress = Math.min(1, currentStep / steps);
    audio.volume = from + (to - from) * progress;

    if (progress >= 1) {
      clearInterval(timer);
      timersRef.current = timersRef.current.filter((id) => id !== timer);
    }
  }, STEP_MS);

  timersRef.current.push(timer);
}

export default function AudioDeck({ memories, activeIndex, started, onFinalScreen }) {
  const audioARef = useRef(null);
  const audioBRef = useRef(null);
  const activeSlotRef = useRef('a');
  const currentUrlRef = useRef('');
  const timersRef = useRef([]);

  const targetIndex = useMemo(() => {
    if (!memories.length) return -1;
    if (onFinalScreen) return memories.length - 1;
    return Math.min(activeIndex, memories.length - 1);
  }, [memories, activeIndex, onFinalScreen]);

  const targetMemory = targetIndex >= 0 ? memories[targetIndex] : null;
  const targetUrl = targetMemory?.audioUrl || '';

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearInterval(id));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    async function transitionAudio() {
      if (!started || !targetUrl) return;
      if (currentUrlRef.current === targetUrl) return;

      const audioA = audioARef.current;
      const audioB = audioBRef.current;
      if (!audioA || !audioB) return;

      timersRef.current.forEach((id) => clearInterval(id));
      timersRef.current = [];

      const currentAudio = activeSlotRef.current === 'a' ? audioA : audioB;
      const nextAudio = activeSlotRef.current === 'a' ? audioB : audioA;

      nextAudio.src = targetUrl;
      nextAudio.currentTime = 0;
      nextAudio.volume = 0;

      try {
        await nextAudio.play();
      } catch {
        return;
      }

      fadeVolume(nextAudio, 0, 1, FADE_DURATION_MS, timersRef);

      if (!currentAudio.paused) {
        fadeVolume(currentAudio, currentAudio.volume || 1, 0, FADE_DURATION_MS, timersRef);
        setTimeout(() => {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }, FADE_DURATION_MS + STEP_MS);
      }

      activeSlotRef.current = activeSlotRef.current === 'a' ? 'b' : 'a';
      currentUrlRef.current = targetUrl;
    }

    transitionAudio();
  }, [targetUrl, started]);

  if (!started || !targetMemory) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 w-[min(92vw,460px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/45 px-4 py-3 shadow-halo backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/15 bg-white/5">
          {targetMemory.songIconUrl ? (
            <img src={targetMemory.songIconUrl} alt="Song icon" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base text-white/70">♪</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.25em] text-glow/75">Memory Soundtrack</p>
          <p className="mt-1 truncate text-sm text-white/85">{targetMemory.title || `Memory ${targetIndex + 1}`}</p>
        </div>
        <div className="flex h-8 w-16 items-end gap-1 rounded-md border border-white/10 bg-black/35 px-2 py-1">
          {[0, 1, 2, 3].map((bar) => (
            <motion.span
              key={`deck-${bar}`}
              className="block w-1.5 rounded-full bg-glow/80"
              initial={{ height: '22%' }}
              animate={{ height: barPatterns[bar], opacity: [0.65, 1, 0.72] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: bar * 0.08 }}
            />
          ))}
        </div>
      </div>

      <audio ref={audioARef} preload="auto" />
      <audio ref={audioBRef} preload="auto" />
    </div>
  );
}
