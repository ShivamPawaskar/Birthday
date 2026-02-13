"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ChapterThreeConfig } from '@/data/story';

function normalizeMediaUrl(url: string) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return encodeURI(trimmed);
  }
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return encodeURI(withSlash);
}

const MUSIC_FADE_MS = 900;

function highlightHiddenLetters(note: string, letters: string[], accentColor: string) {
  if (!letters.length) return note;
  const target = letters.map((letter) => letter.toUpperCase());
  let cursor = 0;

  return note.split('').map((char, idx) => {
    const expected = target[cursor];
    if (expected && char.toUpperCase() === expected) {
      cursor += 1;
      return (
        <span key={`h-${idx}`} style={{ color: accentColor }} className="font-semibold">
          {char}
        </span>
      );
    }
    return <span key={`c-${idx}`}>{char}</span>;
  });
}

export default function ChapterThreeHerWorld({
  sectionId,
  registerRef,
  active,
  chapterThree,
  displayFont,
  primaryTextColor,
  secondaryTextColor,
  accentTextColor
}: {
  sectionId: string;
  registerRef: (id: string) => (node: HTMLElement | null) => void;
  active: boolean;
  chapterThree: ChapterThreeConfig;
  displayFont: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  accentTextColor: string;
}) {
  const [openId, setOpenId] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number>(0);

  const favorites = useMemo(
    () => [...chapterThree.favorites].sort((a, b) => a.order - b.order),
    [chapterThree.favorites]
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
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.preload = 'auto';
    }

    const audio = audioRef.current;
    const src = normalizeMediaUrl(chapterThree.backgroundMusic.audioSrc);
    if (!active || !src) {
      fadeTo(audio, 0, MUSIC_FADE_MS, () => {
        audio.pause();
        audio.currentTime = 0;
      });
      return;
    }

    const target = muted ? 0 : Math.max(0, Math.min(1, chapterThree.backgroundMusic.defaultVolume || 0.35));
    if (audio.src !== new URL(src, window.location.origin).toString()) {
      audio.src = src;
      audio.currentTime = 0;
      audio.volume = 0;
    }
    if (!chapterThree.backgroundMusic.autoplay) return;
    audio.play()
      .then(() => fadeTo(audio, target))
      .catch(() => {
        /* autoplay may be blocked by browser */
      });
  }, [active, chapterThree.backgroundMusic.audioSrc, chapterThree.backgroundMusic.autoplay, chapterThree.backgroundMusic.defaultVolume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !active) return;
    const target = muted ? 0 : Math.max(0, Math.min(1, chapterThree.backgroundMusic.defaultVolume || 0.35));
    fadeTo(audio, target, 240);
  }, [muted, chapterThree.backgroundMusic.defaultVolume, active]);

  useEffect(
    () => () => {
      cancelFade();
    },
    []
  );

  function tryUnlock() {
    if (inputValue.trim().toUpperCase() === (chapterThree.password || '').trim().toUpperCase()) {
      setUnlocked(true);
    }
  }

  return (
    <section id={sectionId} ref={registerRef(sectionId)} className="memory-section relative flex min-h-screen items-center overflow-hidden px-4 py-16 md:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,209,149,0.16),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(146,205,255,0.14),transparent_42%)]" />
      {chapterThree.backgroundMusic.showToggle ? (
        <button
          type="button"
          onClick={() => setMuted((prev) => !prev)}
          className="absolute right-4 top-4 z-30 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white"
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
      ) : null}
      <div className="relative mx-auto w-full max-w-[1400px]">
        <div className="mb-6 text-center">
          <h2 className="text-4xl md:text-6xl" style={{ color: primaryTextColor, fontFamily: displayFont }}>
            {chapterThree.chapterTitle}
          </h2>
          <p className="mt-3 text-sm md:text-base" style={{ color: secondaryTextColor }}>
            {chapterThree.chapterNote}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {favorites.map((item, idx) => {
            const opened = openId === item.id;
            const rotate = ((idx % 6) - 3) * 2.6;

            return (
              <motion.button
                key={item.id}
                type="button"
                className="group relative min-h-[220px] overflow-hidden rounded-2xl border border-white/15 bg-black/30 p-2 text-left shadow-[0_14px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm md:min-h-[280px]"
                style={{ rotate }}
                whileHover={{ y: -4, rotate: rotate + 0.8 }}
                onClick={() => setOpenId((prev) => (prev === item.id ? '' : item.id))}
              >
                <AnimatePresence mode="wait">
                  {!opened ? (
                    <motion.div
                      key={`${item.id}-front`}
                      className="h-full w-full"
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      transition={{ duration: 0.35 }}
                    >
                      <img src={normalizeMediaUrl(item.imageSrc)} alt={item.title} className="h-full min-h-[200px] w-full rounded-xl object-cover md:min-h-[260px]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`${item.id}-back`}
                      className="flex h-full min-h-[200px] flex-col justify-between rounded-xl border border-white/12 bg-[#0b0f19] p-4 md:min-h-[260px]"
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: -90 }}
                      transition={{ duration: 0.35 }}
                    >
                      <h3 className="text-sm md:text-base" style={{ color: primaryTextColor, fontFamily: displayFont }}>
                        {item.title}
                      </h3>
                      <p className="mt-3 text-xs leading-relaxed md:text-sm" style={{ color: secondaryTextColor }}>
                        {highlightHiddenLetters(item.note, item.hiddenLetters, accentTextColor)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-10 mx-auto max-w-xl rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-md">
          <label className="mb-2 block text-xs uppercase tracking-[0.16em]" style={{ color: secondaryTextColor }}>
            {chapterThree.unlockPrompt}
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') tryUnlock();
              }}
              placeholder="Locked"
            />
            <button type="button" onClick={tryUnlock} className="rounded-lg bg-white/15 px-4 py-2 text-sm text-white hover:bg-white/25">
              Unlock
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {unlocked && active && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-2xl text-center"
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <p className="text-4xl md:text-6xl" style={{ color: primaryTextColor, fontFamily: displayFont }}>
                Unlocked
              </p>
              <p className="mx-auto mt-4 max-w-xl text-base md:text-lg" style={{ color: secondaryTextColor }}>
                {chapterThree.unlockMessage}
              </p>
              <button
                type="button"
                onClick={() => setUnlocked(false)}
                className="mt-8 rounded-full border border-white/30 px-6 py-2 text-sm text-white hover:bg-white/10"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
