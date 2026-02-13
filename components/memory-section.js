"use client";

import { useEffect, useMemo, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

const barPatterns = [
  ['22%', '66%', '34%', '70%', '28%'],
  ['44%', '82%', '38%', '74%', '30%'],
  ['28%', '62%', '84%', '42%', '24%'],
  ['48%', '30%', '72%', '32%', '64%'],
  ['24%', '56%', '36%', '68%', '26%']
];
const idlePattern = ['28%', '34%', '30%'];

export default function MemorySection({ memory, index, onEnter, isActive, isPlaying, onTogglePlayback }) {
  const sectionRef = useRef(null);
  const textControls = useAnimation();
  const inView = useInView(sectionRef, { amount: 0.55 });

  useEffect(() => {
    if (inView) {
      onEnter();
      textControls.start('visible');
    }
  }, [inView, onEnter, textControls]);

  const lines = useMemo(
    () => memory.paragraph.split(/[\n\.]/).map((line) => line.trim()).filter(Boolean),
    [memory.paragraph]
  );
  const isVisualizerActive = isActive && isPlaying;

  return (
    <section ref={sectionRef} className="memory-section relative flex min-h-screen items-center px-6 py-16 md:px-16">
      <motion.div
        className="mx-auto grid w-full max-w-6xl gap-10 rounded-3xl border border-white/10 bg-black/25 p-6 backdrop-blur-md md:grid-cols-2 md:p-10"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.2, y: 12 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
        <motion.figure
          className="overflow-hidden rounded-2xl border border-white/10 shadow-halo"
          initial={{ scale: 0.98, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.98, opacity: 0.5 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        >
          {memory.mediaType === 'video' ? (
            <video
              className="h-[52vh] w-full object-cover md:h-[64vh]"
              src={memory.mediaUrl}
              muted
              loop
              playsInline
              autoPlay={inView}
            />
          ) : (
            <img
              src={memory.mediaUrl}
              alt={memory.title || `Memory ${index + 1}`}
              className="h-[52vh] w-full object-cover md:h-[64vh]"
            />
          )}
        </motion.figure>

        <div className="flex flex-col justify-center">
          <motion.p
            className="mb-4 text-xs uppercase tracking-[0.35em] text-glow/80"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            {memory.title || `Memory ${index + 1}`}
          </motion.p>

          <div className="space-y-2">
            {lines.map((line, lineIdx) => (
              <motion.p
                key={`${memory._id}-${lineIdx}`}
                className="text-lg leading-relaxed text-white/88 md:text-2xl"
                initial="hidden"
                animate={textControls}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.85, delay: 0.35 + lineIdx * 0.23 }
                  }
                }}
              >
                {line}{lineIdx < lines.length - 1 ? '.' : ''}
              </motion.p>
            ))}
          </div>

          {memory.caption && (
            <motion.p
              className="mt-6 text-sm italic text-mist/70"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 1 }}
            >
              {memory.caption}
            </motion.p>
          )}

          <motion.div
            className="mt-8 rounded-2xl border border-white/20 bg-black/40 p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.45 }}
          >
            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <button
                type="button"
                onClick={onTogglePlayback}
                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-white/5"
                aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}
                disabled={!isActive}
              >
                {memory.songIconUrl ? (
                  <img src={memory.songIconUrl} alt="Song icon" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg text-white/70">&#9835;</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 text-sm text-white">
                  {isPlaying && isActive ? '||' : '>'}
                </div>
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.26em] text-glow/80">Memory Soundtrack</p>
                <p className="truncate text-sm text-white/85">{memory.title || `Memory ${index + 1}`}</p>
              </div>

              <motion.div
                className="relative flex h-10 w-20 items-end gap-1 overflow-hidden rounded-md border border-emerald-200/20 bg-gradient-to-br from-emerald-200/10 via-white/[0.03] to-cyan-300/10 px-2 py-1"
                animate={{
                  boxShadow: isVisualizerActive
                    ? ['0 0 0 rgba(72, 255, 182, 0)', '0 0 18px rgba(72, 255, 182, 0.28)', '0 0 0 rgba(72, 255, 182, 0)']
                    : ['0 0 0 rgba(72, 255, 182, 0)', '0 0 10px rgba(72, 255, 182, 0.14)', '0 0 0 rgba(72, 255, 182, 0)']
                }}
                transition={{ duration: isVisualizerActive ? 1.3 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-emerald-300/10 via-cyan-200/5 to-emerald-200/10"
                  animate={{ opacity: isVisualizerActive ? [0.25, 0.45, 0.25] : [0.12, 0.22, 0.12] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                {[0, 1, 2, 3, 4].map((bar) => (
                  <motion.span
                    key={`${memory._id}-${bar}`}
                    className="relative z-10 block w-1.5 rounded-full bg-gradient-to-t from-emerald-300 via-green-200 to-cyan-100"
                    initial={{ height: '24%' }}
                    animate={{
                      height: isVisualizerActive ? barPatterns[bar] : idlePattern,
                      opacity: isVisualizerActive ? [0.62, 1, 0.72] : [0.42, 0.62, 0.42],
                      scaleY: isVisualizerActive ? [0.96, 1.08, 0.98] : [0.96, 1.02, 0.96]
                    }}
                    transition={{
                      duration: 1 + bar * 0.09,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: bar * 0.1
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

