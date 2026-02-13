"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ChapterFourConfig } from '@/data/story';

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

function selectFloatingImages(images: string[]) {
  const pool = images.filter(Boolean);
  if (!pool.length) return [];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const count = Math.min(shuffled.length, 5);
  return shuffled.slice(0, Math.max(4, count));
}

export default function ChapterFourMyLove({
  sectionId,
  registerRef,
  active,
  chapterFour
}: {
  sectionId: string;
  registerRef: (id: string) => (node: HTMLElement | null) => void;
  active: boolean;
  chapterFour: ChapterFourConfig;
}) {
  const [opened, setOpened] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number>(0);
  const letterScrollRef = useRef<HTMLDivElement | null>(null);
  const floatingImages = useMemo(() => selectFloatingImages(chapterFour.backgroundImages || []), [chapterFour.backgroundImages]);
  const safeVolume = clampVolume(chapterFour.music.defaultVolume);

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
    const musicSrc = normalizeMediaUrl(chapterFour.music.audioSrc);
    const target = musicMuted ? 0 : safeVolume;

    if (!active || !musicSrc) {
      fadeTo(audio, 0, MUSIC_FADE_MS, () => {
        audio.pause();
        audio.currentTime = 0;
      });
      return;
    }

    if (audio.src !== new URL(musicSrc, window.location.origin).toString()) {
      audio.src = musicSrc;
      audio.currentTime = 0;
      audio.volume = 0;
    }
    if (!chapterFour.music.autoplay) return;
    audio.play()
      .then(() => fadeTo(audio, target))
      .catch(() => {
        /* ignore autoplay block */
      });
  }, [active, chapterFour.music.audioSrc, chapterFour.music.autoplay, safeVolume, musicMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !active) return;
    const target = musicMuted ? 0 : safeVolume;
    fadeTo(audio, target, 240);
  }, [musicMuted, safeVolume, active]);

  useEffect(
    () => () => {
      cancelFade();
    },
    []
  );

  useEffect(() => {
    const container = letterScrollRef.current;
    if (!opened || !container) return;

    container.scrollTop = 0;
    const speed = Math.max(6, Number(chapterFour.scrollSpeed) || 14);
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (container.scrollTop < maxScroll) {
        container.scrollTop = Math.min(maxScroll, container.scrollTop + (speed * delta) / 1000);
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [opened, chapterFour.scrollSpeed, chapterFour.letterText]);

  return (
    <section id={sectionId} ref={registerRef(sectionId)} className="memory-section relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16 md:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,210,156,0.20),transparent_45%),radial-gradient(circle_at_75%_70%,rgba(255,170,120,0.16),transparent_48%)]" />
      <div className="absolute inset-0" style={{ backgroundColor: chapterFour.style.overlayTint }} />

      <div className="pointer-events-none absolute inset-0">
        {floatingImages.map((src, idx) => {
          const positions = [
            { left: '4%', top: '14%' },
            { left: '76%', top: '8%' },
            { left: '12%', top: '62%' },
            { left: '69%', top: '58%' },
            { left: '43%', top: '16%' }
          ];
          const pos = positions[idx % positions.length];
          return (
            <motion.div
              key={`float-${idx}-${src}`}
              className="absolute h-[140px] w-[110px] overflow-hidden rounded-lg border border-white/25 shadow-[0_14px_28px_rgba(0,0,0,0.35)] md:h-[220px] md:w-[170px]"
              style={pos}
              initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
              animate={{
                opacity: [0.24, 0.52, 0.28],
                filter: ['blur(5px)', 'blur(0px)', 'blur(4px)'],
                y: [0, -12, 0],
                x: [0, idx % 2 === 0 ? 8 : -8, 0]
              }}
              transition={{ duration: 16 + idx * 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src={normalizeMediaUrl(src)} alt={`Memory ${idx + 1}`} className="h-full w-full object-cover" />
            </motion.div>
          );
        })}
      </div>

      {chapterFour.music.showToggle ? (
        <button
          type="button"
          className="absolute right-4 top-4 z-30 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white"
          onClick={() => setMusicMuted((prev) => !prev)}
        >
          {musicMuted ? 'Unmute' : 'Mute'}
        </button>
      ) : null}

      <div className="relative z-20 mx-auto w-full max-w-[980px] text-center">
        <div className="mt-6 flex justify-center">
          <motion.button
            type="button"
            className="relative h-[190px] w-[260px] md:h-[240px] md:w-[330px]"
            onClick={() => setOpened(true)}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="absolute left-1/2 top-[22px] h-[54%] w-[96%] -translate-x-1/2 rounded-lg border"
              style={{
                background: `linear-gradient(160deg, ${chapterFour.style.paperColor}, #e8d2b4)`,
                borderColor: chapterFour.style.paperBorderColor
              }}
              animate={opened ? { y: -138, rotateX: 0 } : { y: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />

            <motion.div
              className="absolute inset-x-0 top-[42px] mx-auto h-[58%] w-[94%] origin-top rounded-b-xl border-x border-b"
              style={{ backgroundColor: chapterFour.style.envelopeColor, borderColor: 'rgba(0,0,0,0.2)' }}
            />
            <motion.div
              className="absolute inset-x-0 top-[12px] mx-auto h-[88px] w-[94%] origin-top rounded-t-xl border"
              style={{ backgroundColor: chapterFour.style.envelopeColor, borderColor: 'rgba(0,0,0,0.2)' }}
              animate={opened ? { rotateX: -178, y: -10 } : { rotateX: 0, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
            <span className="absolute inset-x-0 top-[48%] -translate-y-1/2 text-xs uppercase tracking-[0.2em] text-[#51392b]">
              Tap To Open
            </span>
          </motion.button>
        </div>
      </div>

      {opened ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.article
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border p-5 shadow-[0_26px_70px_rgba(0,0,0,0.5)] md:p-8"
            style={{
              borderColor: chapterFour.style.paperBorderColor,
              background: `linear-gradient(180deg, ${chapterFour.style.paperColor}, #ead7bd)`
            }}
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(70,46,31,0.14) 0.8px, transparent 0.8px), linear-gradient(transparent, rgba(77,50,35,0.08))',
                backgroundSize: '4px 4px, 100% 100%'
              }}
            />
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full border border-black/25 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#3d2a1f]"
              onClick={() => setOpened(false)}
            >
              Close
            </button>

            <div ref={letterScrollRef} className="relative z-10 mt-7 h-[56vh] overflow-y-auto pr-2 md:h-[62vh]">
              <p
                className="whitespace-pre-wrap text-[18px] leading-[1.8] md:text-[22px]"
                style={{ color: '#37251b', fontFamily: chapterFour.style.letterFont || '"Times New Roman", serif' }}
              >
                {chapterFour.letterText}
              </p>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </section>
  );
}
