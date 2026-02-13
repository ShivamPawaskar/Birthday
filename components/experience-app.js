"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MemorySection from '@/components/memory-section';
import FinalScreen from '@/components/final-screen';

const landingLines = [
  'This year was not just time passing.',
  'It was moments.',
  'Feelings.',
  'You.'
];
const FADE_DURATION_MS = 1200;
const STEP_MS = 60;

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

export default function ExperienceApp() {
  const [started, setStarted] = useState(false);
  const [memories, setMemories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const audioARef = useRef(null);
  const audioBRef = useRef(null);
  const activeSlotRef = useRef('a');
  const currentUrlRef = useRef('');
  const timersRef = useRef([]);

  useEffect(() => {
    async function loadMemories() {
      try {
        const res = await fetch('/api/memories', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Could not load memories.');
        }
        const data = await res.json();
        setMemories(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch memories.');
      } finally {
        setIsLoading(false);
      }
    }

    loadMemories();
  }, []);

  const hasMemories = memories.length > 0;
  const finalIndex = useMemo(() => memories.length, [memories.length]);
  const targetIndex = useMemo(() => {
    if (!memories.length) return -1;
    if (activeIndex === finalIndex) return memories.length - 1;
    return Math.min(activeIndex, memories.length - 1);
  }, [memories, activeIndex, finalIndex]);
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
      setIsPlaying(true);
    }

    transitionAudio();
  }, [targetUrl, started]);

  async function togglePlayback() {
    const currentAudio = activeSlotRef.current === 'a' ? audioARef.current : audioBRef.current;
    if (!currentAudio || !currentAudio.src) return;

    if (currentAudio.paused) {
      try {
        await currentAudio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      currentAudio.pause();
      setIsPlaying(false);
    }
  }

  function handleReplay() {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveIndex(0);
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-aurora">
      <audio ref={audioARef} preload="auto" />
      <audio ref={audioBRef} preload="auto" />

      <AnimatePresence>
        {!started && (
          <motion.section
            key="landing"
            className="absolute inset-0 z-40 flex items-center justify-center px-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.1, ease: 'easeInOut' } }}
          >
            <div className="max-w-3xl text-center">
              {landingLines.map((line, idx) => (
                <motion.p
                  key={line}
                  className="mb-3 text-3xl font-medium text-mist md:text-5xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.6 + idx * 0.45 }}
                >
                  {line}
                </motion.p>
              ))}

              <motion.button
                type="button"
                className="mt-10 rounded-full border border-white/25 bg-white/10 px-8 py-3 text-sm tracking-[0.3em] text-white backdrop-blur-sm transition hover:bg-white/20"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.9 }}
                onClick={() => setStarted(true)}
              >
                START YOUR WRAP
              </motion.button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section
        ref={scrollRef}
        className={`memory-scroll ${started ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
      >
        {isLoading && (
          <div className="flex h-screen items-center justify-center text-sm tracking-[0.2em] text-white/60">
            LOADING MEMORIES
          </div>
        )}

        {!isLoading && error && (
          <div className="flex h-screen items-center justify-center px-6 text-center text-base text-rose-200">
            {error}
          </div>
        )}

        {!isLoading && !error && !hasMemories && (
          <div className="flex h-screen items-center justify-center px-6 text-center text-base text-white/70">
            Add memories from the admin page to begin the story.
          </div>
        )}

        {hasMemories &&
          memories.map((memory, idx) => (
            <MemorySection
              key={memory._id}
              memory={memory}
              index={idx}
              isActive={activeIndex === idx}
              isPlaying={activeIndex === idx && isPlaying}
              onTogglePlayback={togglePlayback}
              onEnter={() => setActiveIndex(idx)}
            />
          ))}

        {hasMemories && (
          <FinalScreen
            index={finalIndex}
            onEnter={() => setActiveIndex(finalIndex)}
            onReplay={handleReplay}
          />
        )}
      </section>
    </main>
  );
}
