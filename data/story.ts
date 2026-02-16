import defaultConfigJson from './default-config.json';

export type MoodTheme = 'warm' | 'nostalgic' | 'dreamy' | 'intimate' | 'playful';

export type StoryMemory = {
  id: string;
  kind: 'memory';
  chapter: 'how-we-met' | 'our-journey' | 'best-memories-together' | 'how-i-feel-about-you' | 'your-favorites';
  chapterLabel: string;
  chapterNote: string;
  theme: MoodTheme;
  handwrittenTitle: string;
  title: string;
  paragraph: string[];
  mediaType: 'image' | 'video';
  mediaSrc: string;
  audioSrc: string;
  songIconSrc?: string;
};

export type MidLetter = {
  id: string;
  kind: 'letter';
  theme: 'intimate';
  lines: string[];
};

export type StoryBlock = StoryMemory | MidLetter;

export type ThemeBackgroundMap = Record<MoodTheme, string>;
export type ChapterMetaMap = Record<StoryMemory['chapter'], { label: string; note: string }>;
export type ChapterTwoMemory = {
  id: string;
  coverSrc: string;
  videoSrc: string;
  shortMessage: string;
  message: string;
};
export type ChapterTwoAudioSettings = {
  audioSrc: string;
  autoplay: boolean;
  defaultVolume: number;
};
export type ChapterTwoDisplaySettings = {
  theme: MoodTheme;
  introLabel: string;
  introTitle: string;
  introNote: string;
  sectionTitle: string;
  showSectionTitle: boolean;
  showMuteButton: boolean;
};
export type ChapterTwoConfig = {
  memories: ChapterTwoMemory[];
  backgroundMusic: ChapterTwoAudioSettings;
  display: ChapterTwoDisplaySettings;
};
export type ChapterThreeFavorite = {
  id: string;
  title: string;
  imageSrc: string;
  note: string;
  hiddenLetters: string[];
  order: number;
};
export type ChapterThreeConfig = {
  theme: MoodTheme;
  chapterLabel: string;
  chapterTitle: string;
  chapterNote: string;
  unlockPrompt: string;
  password: string;
  unlockMessage: string;
  backgroundMusic: ChapterTwoAudioSettings & { showToggle: boolean };
  favorites: ChapterThreeFavorite[];
};
export type ChapterFourMusicSettings = {
  audioSrc: string;
  autoplay: boolean;
  defaultVolume: number;
  showToggle: boolean;
};
export type ChapterFourStyleSettings = {
  overlayTint: string;
  envelopeColor: string;
  paperColor: string;
  paperBorderColor: string;
  letterFont: string;
};
export type ChapterFourConfig = {
  theme: MoodTheme;
  chapterLabel: string;
  chapterTitle: string;
  chapterNote: string;
  letterText: string;
  scrollSpeed: number;
  backgroundImages: string[];
  music: ChapterFourMusicSettings;
  style: ChapterFourStyleSettings;
};
export type ChapterFiveConfig = {
  theme: MoodTheme;
  chapterLabel: string;
  chapterTitle: string;
  chapterNote: string;
  wishText: string;
  cakeImageSrc: string;
  candleCount: number;
  hiddenBirthdayMessage: string;
  backgroundMusicSrc: string;
  celebrationSoundSrc: string;
  micEnabled: boolean;
};
export type TextStyleConfig = {
  bodyFont: string;
  displayFont: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  accentTextColor: string;
  highlightTextColor: string;
};

export type ExperienceConfig = {
  storyBlocks: StoryBlock[];
  chapterTwo: ChapterTwoConfig;
  chapterThree: ChapterThreeConfig;
  chapterFour: ChapterFourConfig;
  chapterFive: ChapterFiveConfig;
  chapterMeta: ChapterMetaMap;
  textStyle: TextStyleConfig;
  highlightWords: string[];
  themeBackground: ThemeBackgroundMap;
  introLines: string[];
  startButtonText: string;
  finalPrimaryLines: string[];
  finalSecondaryLines: string[];
  finalLoveLine: string;
  replayButtonText: string;
  secretMessage: string;
};

export const chapterOrder: StoryMemory['chapter'][] = [
  'how-we-met',
  'our-journey',
  'best-memories-together',
  'how-i-feel-about-you',
  'your-favorites'
];

export const defaultExperienceConfig: ExperienceConfig = defaultConfigJson as ExperienceConfig;

export const chapterMeta: ChapterMetaMap = defaultExperienceConfig.chapterMeta;
export const storyBlocks: StoryBlock[] = defaultExperienceConfig.storyBlocks;
export const highlightWords: string[] = defaultExperienceConfig.highlightWords;
export const themeBackground: ThemeBackgroundMap = defaultExperienceConfig.themeBackground;
export const chapterTwoDefault: ChapterTwoConfig = defaultExperienceConfig.chapterTwo;
export const chapterThreeDefault: ChapterThreeConfig = defaultExperienceConfig.chapterThree;
export const chapterFourDefault: ChapterFourConfig = defaultExperienceConfig.chapterFour;
export const chapterFiveDefault: ChapterFiveConfig = defaultExperienceConfig.chapterFive;
