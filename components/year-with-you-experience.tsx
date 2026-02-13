"use client";

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChapterTwoHangingMemories from '@/components/chapter-two-hanging-memories';
import ChapterThreeHerWorld from '@/components/chapter-three-her-world';
import ChapterFourMyLove from '@/components/chapter-four-my-love';
import ChapterFiveBirthdayCelebration from '@/components/chapter-five-birthday-celebration';
import { chapterFiveDefault, chapterFourDefault, chapterThreeDefault, chapterTwoDefault, defaultExperienceConfig, type ExperienceConfig, type MoodTheme, type StoryMemory } from '@/data/story';
import { useDualAudioEngine } from '@/hooks/use-dual-audio';
import { useIntersectionActive } from '@/hooks/use-intersection-active';

type ChapterSection = {
  id: string;
  type: 'chapter';
  theme: MoodTheme;
  chapterLabel?: string;
  label: string;
  note: string;
};

type MemorySectionType = {
  id: string;
  type: 'memory';
  memory: StoryMemory;
};

type LetterSection = {
  id: string;
  type: 'letter';
  theme: MoodTheme;
  lines: string[];
};

type FinaleSection = {
  id: string;
  type: 'finale';
  theme: MoodTheme;
};

type ChapterTwoSection = {
  id: 'chapter-two-memories';
  type: 'chapter-two';
  theme: MoodTheme;
};

type ChapterThreeSection = {
  id: 'chapter-three-her-world';
  type: 'chapter-three';
  theme: MoodTheme;
};

type ChapterFourSection = {
  id: 'chapter-four-my-love';
  type: 'chapter-four';
  theme: MoodTheme;
};

type ChapterFiveSection = {
  id: 'chapter-five-birthday';
  type: 'chapter-five';
  theme: MoodTheme;
};

type RenderSection = ChapterSection | MemorySectionType | LetterSection | ChapterTwoSection | ChapterThreeSection | ChapterFourSection | ChapterFiveSection | FinaleSection;

const CONFIG_STORAGE_KEY = 'year-with-you-config.v1';

const breathingAnimation = {
  animate: {
    scale: [1, 1.03, 1],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeChapterTwoMemories(memories: ExperienceConfig['chapterTwo']['memories']) {
  return memories.map((memory, index) => ({
    ...memory,
    id: memory.id || `hang-${index + 1}`,
    coverSrc: memory.coverSrc || '/images/4.jpeg',
    videoSrc: memory.videoSrc || '',
    shortMessage: memory.shortMessage || memory.message || 'Memory',
    message: memory.message || memory.shortMessage || 'Memory'
  }));
}

function normalizeChapterThreeFavorites(favorites: ExperienceConfig['chapterThree']['favorites']) {
  return favorites.map((item, index) => ({
    ...item,
    id: item.id || `fav-${index + 1}`,
    title: item.title || `Favorite ${index + 1}`,
    imageSrc: item.imageSrc || '/images/1.jpeg',
    note: item.note || 'Memory',
    hiddenLetters: Array.isArray(item.hiddenLetters) ? item.hiddenLetters.map((letter) => String(letter).toUpperCase()).filter(Boolean) : [],
    order: typeof item.order === 'number' ? item.order : index + 1
  }));
}

function parseConfig(raw: unknown): ExperienceConfig {
  if (!raw || typeof raw !== 'object') return defaultExperienceConfig;

  const candidate = raw as Partial<ExperienceConfig>;
  return {
    ...defaultExperienceConfig,
    ...candidate,
    storyBlocks: Array.isArray(candidate.storyBlocks) ? candidate.storyBlocks : defaultExperienceConfig.storyBlocks,
    chapterTwo: {
      memories: normalizeChapterTwoMemories(
        Array.isArray(candidate.chapterTwo?.memories) ? candidate.chapterTwo.memories : chapterTwoDefault.memories
      ),
      backgroundMusic: {
        ...chapterTwoDefault.backgroundMusic,
        ...(candidate.chapterTwo?.backgroundMusic || {})
      },
      display: {
        ...chapterTwoDefault.display,
        ...(candidate.chapterTwo?.display || {})
      }
    },
    chapterThree: {
      ...chapterThreeDefault,
      ...(candidate.chapterThree || {}),
      backgroundMusic: {
        ...chapterThreeDefault.backgroundMusic,
        ...(candidate.chapterThree?.backgroundMusic || {})
      },
      favorites: normalizeChapterThreeFavorites(
        Array.isArray(candidate.chapterThree?.favorites) ? candidate.chapterThree.favorites : chapterThreeDefault.favorites
      )
    },
    chapterFour: {
      ...chapterFourDefault,
      ...(candidate.chapterFour || {}),
      backgroundImages: Array.isArray(candidate.chapterFour?.backgroundImages) ? candidate.chapterFour.backgroundImages : chapterFourDefault.backgroundImages,
      music: {
        ...chapterFourDefault.music,
        ...(candidate.chapterFour?.music || {})
      },
      style: {
        ...chapterFourDefault.style,
        ...(candidate.chapterFour?.style || {})
      }
    },
    chapterFive: {
      ...chapterFiveDefault,
      ...(candidate.chapterFive || {})
    },
    chapterMeta: {
      ...defaultExperienceConfig.chapterMeta,
      ...(candidate.chapterMeta || {})
    },
    textStyle: {
      ...defaultExperienceConfig.textStyle,
      ...(candidate.textStyle || {})
    },
    highlightWords: Array.isArray(candidate.highlightWords) ? candidate.highlightWords : defaultExperienceConfig.highlightWords,
    themeBackground: {
      ...defaultExperienceConfig.themeBackground,
      ...(candidate.themeBackground || {})
    },
    introLines: Array.isArray(candidate.introLines) ? candidate.introLines : defaultExperienceConfig.introLines,
    finalPrimaryLines: Array.isArray(candidate.finalPrimaryLines) ? candidate.finalPrimaryLines : defaultExperienceConfig.finalPrimaryLines,
    finalSecondaryLines: Array.isArray(candidate.finalSecondaryLines) ? candidate.finalSecondaryLines : defaultExperienceConfig.finalSecondaryLines
  };
}

function readStoredConfig(): ExperienceConfig {
  try {
    const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return defaultExperienceConfig;
    return parseConfig(JSON.parse(raw));
  } catch {
    return defaultExperienceConfig;
  }
}

function glowText(line: string, words: string[], highlightTextColor: string) {
  if (!words.length) return [<span key={line}>{line}</span>];
  const regex = new RegExp(`\\b(${words.map((word) => escapeRegExp(word)).join('|')})\\b`, 'gi');
  const parts = line.split(regex);

  return parts.map((part, idx) => {
    const match = words.includes(part.toLowerCase());
    if (!match) {
      return <span key={`${part}-${idx}`}>{part}</span>;
    }

    return (
      <span key={`${part}-${idx}`} style={{ color: highlightTextColor }} className="drop-shadow-[0_0_10px_rgba(142,255,203,0.55)]">
        {part}
      </span>
    );
  });
}

function Intro({
  started,
  onStart,
  lines,
  buttonText,
  displayFont,
  primaryTextColor
}: {
  started: boolean;
  onStart: () => void;
  lines: string[];
  buttonText: string;
  displayFont: string;
  primaryTextColor: string;
}) {
  return (
    <AnimatePresence>
      {!started && (
        <motion.section
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.4, ease: 'easeInOut' } }}
        >
          <motion.div className="absolute inset-0 bg-gradient-to-br from-[#2b1918] via-[#160f1d] to-[#0a0b10]" {...breathingAnimation} />
          <div className="absolute inset-0 bg-black/35" />

          <div className="relative mx-auto w-full max-w-6xl px-8 text-center">
            {lines.map((line, index) => (
              <motion.p
                key={line}
                className="mb-4 text-3xl text-[#f7e7df] md:text-6xl"
                style={{ fontFamily: displayFont, color: primaryTextColor }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 1.5, duration: 1.3, ease: 'easeInOut' }}
              >
                {line}
              </motion.p>
            ))}

            <motion.button
              type="button"
              onClick={onStart}
              className="mt-10 rounded-full border border-white/20 bg-white/10 px-9 py-3 text-xs tracking-[0.32em] text-white transition hover:bg-white/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.8, duration: 1.2, ease: 'easeInOut' }}
            >
              {buttonText}
            </motion.button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function ChapterBreak({
  section,
  registerRef,
  active,
  textStyle
}: {
  section: ChapterSection;
  registerRef: (id: string) => (node: HTMLElement | null) => void;
  active: boolean;
  textStyle: ExperienceConfig['textStyle'];
}) {
  return (
    <section id={section.id} ref={registerRef(section.id)} className="memory-section relative flex min-h-screen items-center justify-center px-8">
      <motion.div
        className="max-w-3xl text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 10 }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
      >
        <p className="text-xs uppercase tracking-[0.35em]" style={{ color: textStyle.accentTextColor }}>
          {section.chapterLabel || 'Chapter'}
        </p>
        <h2 className="mt-4 text-4xl md:text-6xl" style={{ color: textStyle.primaryTextColor, fontFamily: textStyle.displayFont }}>
          {section.label}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base md:text-lg" style={{ color: textStyle.secondaryTextColor }}>
          {section.note}
        </p>
      </motion.div>
    </section>
  );
}

function LetterMoment({
  section,
  registerRef,
  active,
  textStyle
}: {
  section: LetterSection;
  registerRef: (id: string) => (node: HTMLElement | null) => void;
  active: boolean;
  textStyle: ExperienceConfig['textStyle'];
}) {
  return (
    <section id={section.id} ref={registerRef(section.id)} className="memory-section relative flex min-h-screen items-center justify-center px-8">
      <motion.div
        className="max-w-3xl text-center"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0.3 }}
        transition={{ duration: 2.2, ease: 'easeInOut' }}
      >
        {section.lines.map((line, idx) => (
          <motion.p
            key={line}
            className="mb-4 text-3xl md:text-5xl"
            style={{ color: textStyle.primaryTextColor, fontFamily: textStyle.displayFont }}
            initial={{ opacity: 0, y: 12 }}
            animate={active ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.4, delay: idx * 1.3, ease: 'easeInOut' }}
          >
            {line}
          </motion.p>
        ))}
      </motion.div>
    </section>
  );
}

function MemoryScene({
  section,
  registerRef,
  active,
  isPlaying,
  onToggle,
  highlightWords,
  highlightTextColor,
  textStyle
}: {
  section: MemorySectionType;
  registerRef: (id: string) => (node: HTMLElement | null) => void;
  active: boolean;
  isPlaying: boolean;
  onToggle: () => void;
  highlightWords: string[];
  highlightTextColor: string;
  textStyle: ExperienceConfig['textStyle'];
}) {
  const bars = [0, 1, 2, 3, 4];
  const activePattern = [
    ['18%', '62%', '32%', '74%', '24%'],
    ['34%', '76%', '38%', '84%', '28%'],
    ['26%', '52%', '68%', '44%', '34%'],
    ['42%', '64%', '30%', '72%', '24%'],
    ['30%', '72%', '48%', '68%', '32%']
  ];

  return (
    <section id={section.id} ref={registerRef(section.id)} className="memory-section relative flex min-h-screen items-center px-5 py-14 md:px-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 6 }).map((_, idx) => (
          <motion.span
            key={`${section.id}-particle-${idx}`}
            className="absolute h-2 w-2 rounded-full bg-[#ffd8a8]/40"
            style={{ left: `${12 + idx * 14}%`, top: `${10 + (idx % 4) * 18}%` }}
            animate={{ y: [0, -22, 0], opacity: [0.1, 0.45, 0.1] }}
            transition={{ duration: 10 + idx * 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-[8%] rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(157,255,203,0.16),transparent_62%)]"
        animate={{ opacity: active ? 1 : 0.3 }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
      />

      <motion.article
        className="relative mx-auto grid w-full max-w-6xl gap-8 rounded-[30px] border border-white/12 bg-black/30 p-5 backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr] md:p-10"
        initial={{ opacity: 0, y: 22 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0.45, y: 8 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        <motion.div
          className="overflow-hidden rounded-2xl border border-white/10"
          animate={active ? { y: [0, -12, 0, 10, 0] } : { y: 0 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        >
          {section.memory.mediaType === 'video' ? (
            <video className="h-[52vh] w-full object-cover md:h-[66vh]" src={section.memory.mediaSrc} muted autoPlay loop playsInline />
          ) : (
            <img src={section.memory.mediaSrc} alt={section.memory.title} className="h-[52vh] w-full object-cover md:h-[66vh]" />
          )}
        </motion.div>

        <div className="flex flex-col justify-center">
          <p className="text-sm italic tracking-[0.12em]" style={{ color: textStyle.secondaryTextColor }}>
            {section.memory.handwrittenTitle}
          </p>
          <h3 className="mt-2 text-3xl md:text-5xl" style={{ color: textStyle.primaryTextColor, fontFamily: textStyle.displayFont }}>
            {section.memory.title}
          </h3>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-5">
            {section.memory.paragraph.map((line, idx) => (
              <motion.p
                key={`${section.id}-line-${idx}`}
                className="mb-3 text-lg leading-relaxed md:text-2xl"
                style={{ color: textStyle.primaryTextColor }}
                initial={{ opacity: 0, y: 16 }}
                animate={active ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.35, delay: idx * 0.45, ease: 'easeInOut' }}
              >
                {glowText(line, highlightWords, highlightTextColor)}
              </motion.p>
            ))}
          </div>

          <motion.div
            className="mt-6 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/45 px-4 py-3"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <button
              type="button"
              onClick={onToggle}
              disabled={!active}
              className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/15 bg-white/5"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {section.memory.songIconSrc ? (
                <img src={section.memory.songIconSrc} alt="Song icon" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-white/80">*</span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-xs text-white">{isPlaying ? 'II' : '>'}</span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: textStyle.accentTextColor }}>
                Memory Soundtrack
              </p>
              <p className="truncate text-sm" style={{ color: textStyle.secondaryTextColor }}>
                {section.memory.handwrittenTitle}
              </p>
            </div>

            <div className="relative flex h-10 w-20 items-end gap-1 overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-[#8fffc6]/15 via-white/[0.03] to-[#9ac5ff]/10 px-2 py-1">
              {bars.map((bar) => (
                <motion.span
                  key={`${section.id}-bar-${bar}`}
                  className="block w-1.5 rounded-full bg-gradient-to-t from-[#8dffbf] via-[#c6ffe8] to-[#b3f5ff]"
                  initial={{ height: '26%' }}
                  animate={{
                    height: active && isPlaying ? activePattern[bar] : ['22%', '28%', '22%'],
                    opacity: active && isPlaying ? [0.6, 1, 0.72] : [0.38, 0.5, 0.38]
                  }}
                  transition={{ duration: 1.2 + bar * 0.08, repeat: Infinity, ease: 'easeInOut', delay: bar * 0.1 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.article>
    </section>
  );
}

function Finale({
  section,
  registerRef,
  active,
  onReplay,
  primaryLines,
  secondaryLines,
  loveLine,
  replayButtonText,
  textStyle
}: {
  section: FinaleSection;
  registerRef: (id: string) => (node: HTMLElement | null) => void;
  active: boolean;
  onReplay: () => void;
  primaryLines: string[];
  secondaryLines: string[];
  loveLine: string;
  replayButtonText: string;
  textStyle: ExperienceConfig['textStyle'];
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }

    setPhase(1);
    const second = setTimeout(() => setPhase(2), 3000);
    const love = setTimeout(() => {
      setPhase(3);
    }, 9000);
    const replay = setTimeout(() => setPhase(4), 14000);

    return () => {
      clearTimeout(second);
      clearTimeout(love);
      clearTimeout(replay);
    };
  }, [active]);

  return (
    <section id={section.id} ref={registerRef(section.id)} className="memory-section relative flex min-h-screen items-center justify-center overflow-hidden px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,200,145,0.12),transparent_60%)]" />
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: phase >= 3 ? 0.72 : 0.35, backgroundColor: phase >= 3 ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.25)' }}
        transition={{ duration: 2.2, ease: 'easeInOut' }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 text-center">
        <AnimatePresence mode="wait">
          {phase < 3 && (
            <motion.div
              key="phase-a"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
            >
              <p className="text-4xl leading-[1.24] md:text-6xl md:leading-[1.22]" style={{ color: textStyle.primaryTextColor, fontFamily: textStyle.displayFont }}>
                {renderLines(primaryLines)}
              </p>
              {phase >= 2 && (
                <motion.p
                  className="mt-10 text-2xl leading-[1.35] md:text-4xl md:leading-[1.28]"
                  style={{ color: textStyle.secondaryTextColor }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                >
                  {renderLines(secondaryLines)}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {phase >= 3 && (
          <motion.p
            className="text-5xl md:text-7xl"
            style={{ color: textStyle.primaryTextColor, fontFamily: textStyle.displayFont }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          >
            {loveLine}
          </motion.p>
        )}

        {phase >= 4 && (
          <motion.button
            type="button"
            onClick={onReplay}
            className="mt-12 rounded-full border border-white/25 bg-white/10 px-8 py-3 text-xs tracking-[0.3em] transition hover:bg-white/20"
            style={{ color: textStyle.primaryTextColor }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {replayButtonText}
          </motion.button>
        )}
      </div>
    </section>
  );
}

function ProgressRail({ progress }: { progress: number }) {
  return (
    <div className="pointer-events-none fixed right-4 top-1/2 z-40 h-[52vh] w-[2px] -translate-y-1/2 bg-white/15">
      <motion.div
        className="w-full origin-top bg-gradient-to-b from-[#9effc9] via-[#b4f0ff] to-[#fbd0b2]"
        animate={{ scaleY: Math.max(0.02, progress) }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ height: '100%' }}
      />
    </div>
  );
}

function renderLines(lines: string[]) {
  return lines.map((line, index) => (
    <span key={`${line}-${index}`} className="mb-2 block md:mb-3">
      {line}
    </span>
  ));
}

export default function YearWithYouExperience() {
  const [started, setStarted] = useState(false);
  const [config, setConfig] = useState<ExperienceConfig>(defaultExperienceConfig);

  useEffect(() => {
    setConfig(readStoredConfig());

    const reload = () => setConfig(readStoredConfig());
    window.addEventListener('storage', reload);
    window.addEventListener('year-with-you-config-updated', reload);

    return () => {
      window.removeEventListener('storage', reload);
      window.removeEventListener('year-with-you-config-updated', reload);
    };
  }, []);

  const sections = useMemo<RenderSection[]>(() => {
    const items: RenderSection[] = [];
    const seen = new Set<string>();

    config.storyBlocks.forEach((block) => {
      if (block.kind === 'memory') {
        if (!seen.has(block.chapter)) {
          seen.add(block.chapter);
          items.push({
            id: `chapter-${block.chapter}`,
            type: 'chapter',
            theme: block.theme,
            label: config.chapterMeta[block.chapter]?.label || defaultExperienceConfig.chapterMeta[block.chapter].label,
            note: config.chapterMeta[block.chapter]?.note || defaultExperienceConfig.chapterMeta[block.chapter].note
          });
        }
        items.push({ id: block.id, type: 'memory', memory: block });
      }

      if (block.kind === 'letter') {
        items.push({ id: block.id, type: 'letter', theme: block.theme, lines: block.lines });
      }
    });

    items.push({
      id: 'chapter-two',
      type: 'chapter',
      theme: config.chapterTwo.display.theme,
      chapterLabel: config.chapterTwo.display.introLabel,
      label: config.chapterTwo.display.introTitle,
      note: config.chapterTwo.display.introNote
    });
    items.push({ id: 'chapter-two-memories', type: 'chapter-two', theme: config.chapterTwo.display.theme });
    items.push({
      id: 'chapter-three',
      type: 'chapter',
      theme: config.chapterThree.theme,
      chapterLabel: config.chapterThree.chapterLabel,
      label: config.chapterThree.chapterTitle,
      note: config.chapterThree.chapterNote
    });
    items.push({ id: 'chapter-three-her-world', type: 'chapter-three', theme: config.chapterThree.theme });
    items.push({
      id: 'chapter-four',
      type: 'chapter',
      theme: config.chapterFour.theme,
      chapterLabel: config.chapterFour.chapterLabel,
      label: config.chapterFour.chapterTitle,
      note: config.chapterFour.chapterNote
    });
    items.push({ id: 'chapter-four-my-love', type: 'chapter-four', theme: config.chapterFour.theme });
    items.push({
      id: 'chapter-five',
      type: 'chapter',
      theme: config.chapterFive.theme,
      chapterLabel: config.chapterFive.chapterLabel,
      label: config.chapterFive.chapterTitle,
      note: config.chapterFive.chapterNote
    });
    items.push({ id: 'chapter-five-birthday', type: 'chapter-five', theme: config.chapterFive.theme });
    return items;
  }, [config.storyBlocks, config.chapterTwo.display, config.chapterThree, config.chapterFour, config.chapterFive]);

  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
  const { activeId, registerRef } = useIntersectionActive(sectionIds, started, 0.6);
  const activeIndex = Math.max(0, sectionIds.indexOf(activeId));

  const activeTheme = useMemo(() => {
    const activeSection = sections.find((section) => section.id === activeId);
    if (!activeSection) return 'warm';
    if (activeSection.type === 'memory') return activeSection.memory.theme;
    return activeSection.theme;
  }, [sections, activeId]);

  const { isPlaying, crossfadeTo, togglePlayback, playHeartbeatIntro, fadeOutCurrent, reset } = useDualAudioEngine();

  useEffect(() => {
    if (!started) return;

    const activeSection = sections.find((section) => section.id === activeId);
    if (!activeSection) return;

    if (activeSection.type === 'memory') {
      crossfadeTo(activeSection.memory.audioSrc);
    }
  }, [started, activeId, sections, crossfadeTo]);

  useEffect(() => {
    if (!started) return;
    if (!activeId.startsWith('chapter-two')) return;
    fadeOutCurrent(900);
  }, [started, activeId, fadeOutCurrent]);

  async function handleStart() {
    setStarted(true);

    await playHeartbeatIntro();

    const firstMemory = sections.find((section): section is MemorySectionType => section.type === 'memory');
    if (firstMemory) {
      await crossfadeTo(firstMemory.memory.audioSrc);
    }
  }

  function handleReplay() {
    reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStarted(false);
  }

  return (
    <main className="relative h-screen overflow-hidden text-white" style={{ fontFamily: config.textStyle.bodyFont, color: config.textStyle.primaryTextColor }}>
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${config.themeBackground[activeTheme] || defaultExperienceConfig.themeBackground[activeTheme]}`}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
      />
      <div className="film-grain pointer-events-none fixed inset-0 z-30" />

      <Intro
        started={started}
        onStart={handleStart}
        lines={config.introLines}
        buttonText={config.startButtonText}
        displayFont={config.textStyle.displayFont}
        primaryTextColor={config.textStyle.primaryTextColor}
      />
      <ProgressRail progress={activeIndex / Math.max(1, sectionIds.length - 1)} />

      <section className={`memory-scroll relative z-20 ${started ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
        {sections.map((section) => {
          const active = section.id === activeId;

          if (section.type === 'chapter') {
            return <ChapterBreak key={section.id} section={section} registerRef={registerRef} active={active} textStyle={config.textStyle} />;
          }

          if (section.type === 'memory') {
            return (
              <MemoryScene
                key={section.id}
                section={section}
                registerRef={registerRef}
                active={active}
                isPlaying={active && isPlaying}
                onToggle={togglePlayback}
                highlightWords={config.highlightWords}
                highlightTextColor={config.textStyle.highlightTextColor}
                textStyle={config.textStyle}
              />
            );
          }

          if (section.type === 'letter') {
            return <LetterMoment key={section.id} section={section} registerRef={registerRef} active={active} textStyle={config.textStyle} />;
          }

          if (section.type === 'chapter-two') {
            return (
              <ChapterTwoHangingMemories
                key={section.id}
                sectionId={section.id}
                registerRef={registerRef}
                active={active}
                chapterTwo={config.chapterTwo}
                displayFont={config.textStyle.displayFont}
                primaryTextColor={config.textStyle.primaryTextColor}
                secondaryTextColor={config.textStyle.secondaryTextColor}
                accentTextColor={config.textStyle.accentTextColor}
              />
            );
          }

          if (section.type === 'chapter-three') {
            return (
              <ChapterThreeHerWorld
                key={section.id}
                sectionId={section.id}
                registerRef={registerRef}
                active={active}
                chapterThree={config.chapterThree}
                displayFont={config.textStyle.displayFont}
                primaryTextColor={config.textStyle.primaryTextColor}
                secondaryTextColor={config.textStyle.secondaryTextColor}
                accentTextColor={config.textStyle.accentTextColor}
              />
            );
          }

          if (section.type === 'chapter-four') {
            return (
              <ChapterFourMyLove
                key={section.id}
                sectionId={section.id}
                registerRef={registerRef}
                active={active}
                chapterFour={config.chapterFour}
              />
            );
          }

          if (section.type === 'chapter-five') {
            return (
              <ChapterFiveBirthdayCelebration
                key={section.id}
                sectionId={section.id}
                registerRef={registerRef}
                active={active}
                chapterFive={config.chapterFive}
                displayFont={config.textStyle.displayFont}
              />
            );
          }

          return (
            <Finale
              key={section.id}
              section={section}
              registerRef={registerRef}
              active={active}
              onReplay={handleReplay}
              primaryLines={config.finalPrimaryLines}
              secondaryLines={config.finalSecondaryLines}
              loveLine={config.finalLoveLine}
              replayButtonText={config.replayButtonText}
              textStyle={config.textStyle}
            />
          );
        })}
      </section>
    </main>
  );
}
