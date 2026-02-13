"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import type { ChapterTwoConfig } from '@/data/story';

const VIDEO_DUCK_RATIO = 0.45;
const DRAG_THRESHOLD_PX = 6;
const MUSIC_FADE_MS = 900;

function clampVolume(value: number) {
  if (Number.isNaN(value)) return 0.6;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function normalizeMediaUrl(url: string) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return encodeURI(trimmed);
  }
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return encodeURI(withSlash);
}

export default function ChapterTwoHangingMemories({
  sectionId,
  registerRef,
  active,
  chapterTwo,
  displayFont,
  primaryTextColor,
  secondaryTextColor,
  accentTextColor
}: {
  sectionId: string;
  registerRef: (id: string) => (node: HTMLElement | null) => void;
  active: boolean;
  chapterTwo: ChapterTwoConfig;
  displayFont: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  accentTextColor: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const suppressClickRef = useRef(false);
  const dragStateRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    moved: false
  });

  const memories = chapterTwo.memories || [];
  const safeVolume = clampVolume(chapterTwo.backgroundMusic.defaultVolume);
  const hasSelection = selectedIndex !== null && selectedIndex >= 0 && selectedIndex < memories.length;
  const selectedMemory = hasSelection ? memories[selectedIndex] : null;
  const selectedVideoSrc = normalizeMediaUrl(selectedMemory?.videoSrc || '');
  const effectiveVolume = (isMuted ? 0 : safeVolume) * (hasSelection ? VIDEO_DUCK_RATIO : 1);

  const polaroidAngles = useMemo(() => memories.map((_, idx) => ((idx % 6) - 3) * 2.4), [memories]);

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
    audio.volume = 0;
  }, [effectiveVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const bgMusicSrc = normalizeMediaUrl(chapterTwo.backgroundMusic.audioSrc);
    if (!active || !bgMusicSrc) {
      fadeTo(audio, 0, MUSIC_FADE_MS, () => {
        audio.pause();
        audio.currentTime = 0;
      });
      return;
    }

    if (audio.src !== new URL(bgMusicSrc, window.location.origin).toString()) {
      audio.src = bgMusicSrc;
      audio.currentTime = 0;
      audio.volume = 0;
    }
    if (!chapterTwo.backgroundMusic.autoplay) return;

    audio.play()
      .then(() => fadeTo(audio, effectiveVolume))
      .catch(() => {
        /* ignore autoplay block */
      });
  }, [active, chapterTwo.backgroundMusic.audioSrc, chapterTwo.backgroundMusic.autoplay, effectiveVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !active) return;
    fadeTo(audio, effectiveVolume, 260);
  }, [effectiveVolume, active]);

  useEffect(
    () => () => {
      cancelFade();
    },
    []
  );

  useEffect(() => {
    if (active) return;
    setSelectedIndex(null);
  }, [active]);

  useEffect(() => {
    if (!selectedMemory || !selectedVideoSrc || !videoRef.current) return;
    setVideoError('');
    setAutoplayBlocked(false);
    videoRef.current.load();
    videoRef.current.play().catch(() => setAutoplayBlocked(true));
  }, [selectedMemory, selectedVideoSrc]);

  function openMemory(index: number) {
    if (suppressClickRef.current) return;
    if (!memories[index]) return;
    setVideoError('');
    setAutoplayBlocked(false);
    setSelectedIndex(index);
  }

  function closeMemory() {
    setSelectedIndex(null);
  }

  function nextMemory() {
    if (!memories.length) return;
    setSelectedIndex((prev) => {
      const current = prev ?? 0;
      return (current + 1) % memories.length;
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!stripRef.current) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const container = stripRef.current;
    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      moved: false
    };
    container.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!stripRef.current) return;
    const drag = dragStateRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
      drag.moved = true;
    }
    stripRef.current.scrollLeft = drag.startScrollLeft - deltaX;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!stripRef.current) return;
    const drag = dragStateRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    suppressClickRef.current = drag.moved;
    dragStateRef.current.active = false;
    stripRef.current.releasePointerCapture(event.pointerId);
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  return (
    <section id={sectionId} ref={registerRef(sectionId)} className="memory-section relative flex min-h-screen items-center overflow-hidden px-2 py-14 md:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 6 }).map((_, idx) => (
          <motion.span
            key={`chapter-two-particle-${idx}`}
            className="absolute h-2 w-2 rounded-full bg-[#ffd8a8]/40"
            style={{ left: `${12 + idx * 14}%`, top: `${12 + (idx % 4) * 18}%` }}
            animate={{ y: [0, -18, 0], opacity: [0.1, 0.45, 0.1] }}
            transition={{ duration: 10 + idx * 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <div className="absolute inset-[8%] rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(157,255,203,0.12),transparent_62%)]" />
      <div className="relative mx-auto w-full max-w-[1500px]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            {chapterTwo.display.showSectionTitle ? (
              <h2 className="text-3xl md:text-5xl" style={{ color: primaryTextColor, fontFamily: displayFont }}>
                {chapterTwo.display.sectionTitle}
              </h2>
            ) : null}
          </div>
          {chapterTwo.display.showMuteButton ? (
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className="rounded-full border border-white/30 bg-black/35 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          ) : null}
        </div>

        <div className="relative pt-10">
          <div className="pointer-events-none absolute left-0 right-0 top-6 h-[2px] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          <div
            ref={stripRef}
            className="no-scrollbar flex cursor-grab gap-4 overflow-x-auto px-1 pb-5 active:cursor-grabbing md:gap-5 md:px-2"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {memories.map((memory, index) => (
              <motion.button
                key={memory.id}
                type="button"
                className="group relative mt-3 w-[240px] shrink-0 rounded-sm border border-black/10 bg-white p-3 pb-14 text-left shadow-[0_18px_34px_rgba(0,0,0,0.35)] md:w-[260px] lg:w-[280px] xl:w-[300px]"
                style={{ rotate: polaroidAngles[index] }}
                whileHover={{ y: -6, rotate: polaroidAngles[index] + 1 }}
                transition={{ duration: 0.22 }}
                onClick={() => openMemory(index)}
              >
                <span className="absolute -top-7 left-1/2 h-8 w-[2px] -translate-x-1/2 bg-white/60" />
                <span className="absolute -top-2 left-1/2 h-4 w-8 -translate-x-1/2 rounded-sm bg-zinc-200 shadow" />
                <div className="h-[240px] w-full overflow-hidden rounded-sm bg-zinc-100 md:h-[260px] lg:h-[280px] xl:h-[300px]">
                  <video
                    src={normalizeMediaUrl(memory.videoSrc)}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    poster={normalizeMediaUrl(memory.coverSrc)}
                  />
                </div>
                <p className="absolute bottom-3 left-3 right-3 h-9 overflow-hidden text-[11px] leading-[1.2] text-black">
                  {memory.shortMessage || memory.message}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {selectedMemory && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4">
          <article className="w-full max-w-3xl rounded-2xl border border-white/15 bg-[#090b12] p-4 md:p-6">
            <video
              ref={videoRef}
              key={selectedMemory.id}
              className="max-h-[62vh] w-full rounded-xl bg-black"
              src={selectedVideoSrc}
              autoPlay
              muted
              controls
              playsInline
              preload="auto"
              onLoadedData={() => {
                if (!videoRef.current) return;
                videoRef.current.play().catch(() => setAutoplayBlocked(true));
              }}
              onError={() => {
                setVideoError('This video could not be loaded. Check the video file/url in Chapter 2 admin.');
              }}
            />
            {videoError ? <p className="mt-3 text-sm text-rose-300">{videoError}</p> : null}
            {autoplayBlocked && !videoError ? (
              <button
                type="button"
                className="mt-3 rounded border border-white/30 px-3 py-1 text-xs uppercase tracking-[0.15em]"
                style={{ color: accentTextColor }}
                onClick={() => {
                  if (!videoRef.current) return;
                  videoRef.current.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
                }}
              >
                Tap to Play Video
              </button>
            ) : null}
            <p className="mt-4 text-sm md:text-base" style={{ color: secondaryTextColor }}>
              {selectedMemory.message}
            </p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={nextMemory} className="rounded-lg bg-emerald-400 px-5 py-2 text-sm font-semibold text-black">
                Next
              </button>
              <button type="button" onClick={closeMemory} className="rounded-lg border border-white/30 px-5 py-2 text-sm text-white">
                Close
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
