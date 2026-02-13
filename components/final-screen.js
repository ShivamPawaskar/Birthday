"use client";

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function FinalScreen({ index, onEnter, onReplay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.55 });

  useEffect(() => {
    if (inView) onEnter();
  }, [inView, onEnter]);

  return (
    <section ref={ref} className="memory-section relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="soft-particles absolute inset-0">
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 19) % 100}%`,
              bottom: `${(i * 11) % 70}%`,
              animationDelay: `${(i % 9) * 0.8}s`
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 max-w-3xl text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      >
        <p className="mb-4 text-xs uppercase tracking-[0.32em] text-white/65">Finale</p>
        <h2 className="text-4xl leading-tight text-mist md:text-6xl">
          If this year had a soundtrack,
          <br />
          it would sound like you.
        </h2>
        <p className="mt-5 text-2xl text-white/90 md:text-3xl">Happy Birthday ?</p>

        <button
          type="button"
          onClick={onReplay}
          className="mt-10 rounded-full border border-white/25 bg-white/10 px-7 py-3 text-xs tracking-[0.3em] transition hover:bg-white/20"
        >
          REPLAY
        </button>
      </motion.div>
    </section>
  );
}
