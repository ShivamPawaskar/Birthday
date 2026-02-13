"use client";

import { useCallback, useMemo, useRef, useState } from 'react';

const CROSSFADE_MS = 3500;

function animateVolume(audio: HTMLAudioElement, from: number, to: number, duration: number, onEnd?: () => void) {
  const start = performance.now();

  function tick(now: number) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
    audio.volume = from + (to - from) * eased;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else if (onEnd) {
      onEnd();
    }
  }

  requestAnimationFrame(tick);
}

export function useDualAudioEngine() {
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const activeSlotRef = useRef<'a' | 'b'>('a');
  const currentTrackRef = useRef('');
  const [isPlaying, setIsPlaying] = useState(false);

  const currentAudio = useMemo(
    () => (activeSlotRef.current === 'a' ? audioARef.current : audioBRef.current),
    [isPlaying]
  );

  const getPair = useCallback(() => {
    const current = activeSlotRef.current === 'a' ? audioARef.current : audioBRef.current;
    const incoming = activeSlotRef.current === 'a' ? audioBRef.current : audioARef.current;
    return { current, incoming };
  }, []);

  const mountElements = useCallback(() => {
    if (!audioARef.current) {
      audioARef.current = new Audio();
      audioARef.current.loop = true;
      audioARef.current.preload = 'auto';
    }
    if (!audioBRef.current) {
      audioBRef.current = new Audio();
      audioBRef.current.loop = true;
      audioBRef.current.preload = 'auto';
    }
  }, []);

  const playHeartbeatIntro = useCallback(async () => {
    mountElements();
    const beat = new Audio('/audio/heartbeat.mp3');
    beat.preload = 'auto';

    for (let i = 0; i < 2; i += 1) {
      beat.currentTime = 0;
      try {
        await beat.play();
      } catch {
        break;
      }
      await new Promise((resolve) => {
        beat.onended = resolve;
        setTimeout(resolve, 1200);
      });
    }
  }, [mountElements]);

  const crossfadeTo = useCallback(
    async (trackSrc: string) => {
      mountElements();
      if (!trackSrc) return;
      if (currentTrackRef.current === trackSrc) return;

      const { current, incoming } = getPair();
      if (!incoming) return;

      incoming.src = trackSrc;
      incoming.currentTime = 0;
      incoming.volume = 0;

      try {
        await incoming.play();
      } catch {
        setIsPlaying(false);
        return;
      }

      if (current && !current.paused) {
        animateVolume(current, current.volume, 0, CROSSFADE_MS, () => {
          current.pause();
          current.currentTime = 0;
        });
      }
      animateVolume(incoming, 0, 1, CROSSFADE_MS);

      activeSlotRef.current = activeSlotRef.current === 'a' ? 'b' : 'a';
      currentTrackRef.current = trackSrc;
      setIsPlaying(true);
    },
    [getPair, mountElements]
  );

  const togglePlayback = useCallback(async () => {
    const active = activeSlotRef.current === 'a' ? audioARef.current : audioBRef.current;
    if (!active) return;

    if (active.paused) {
      try {
        await active.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      active.pause();
      setIsPlaying(false);
    }
  }, []);

  const fadeOutCurrent = useCallback((duration = 8000) => {
    const active = activeSlotRef.current === 'a' ? audioARef.current : audioBRef.current;
    if (!active) return;

    animateVolume(active, active.volume || 1, 0, duration, () => {
      active.pause();
      active.currentTime = 0;
      setIsPlaying(false);
    });
  }, []);

  const reset = useCallback(() => {
    [audioARef.current, audioBRef.current].forEach((audio) => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
    });
    activeSlotRef.current = 'a';
    currentTrackRef.current = '';
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    currentAudio,
    crossfadeTo,
    togglePlayback,
    playHeartbeatIntro,
    fadeOutCurrent,
    reset
  };
}
