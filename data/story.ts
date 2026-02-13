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

export const chapterMeta: ChapterMetaMap = {
  'how-we-met': {
    label: 'How We Met',
    note: 'Where everything quietly changed.'
  },
  'our-journey': {
    label: 'Our Journey',
    note: 'Small days that became our story.'
  },
  'best-memories-together': {
    label: 'Best Memories Together',
    note: 'The moments I replay when I miss you.'
  },
  'how-i-feel-about-you': {
    label: 'How I Feel About You',
    note: 'The words I never want to hold back.'
  },
  'your-favorites': {
    label: 'Your Favorites',
    note: 'The little things that are so you.'
  }
};

const sharedAudioSrc = '/audio/yung%20kai%20-%20my%20love%20my%20love%20my%20love%20(Lyrics)%20-%20(320%20Kbps).mp3';

export const storyBlocks: StoryBlock[] = [
  {
    id: 'meet-01',
    kind: 'memory',
    chapter: 'how-we-met',
    chapterLabel: chapterMeta['how-we-met'].label,
    chapterNote: chapterMeta['how-we-met'].note,
    theme: 'warm',
    handwrittenTitle: 'The First Look',
    title: 'When We Met',
    paragraph: [
      'I still remember that first moment, like the world slowed down just enough for me to notice you.',
      'You smiled, and suddenly everything noisy felt far away.',
      'It did not feel dramatic. It felt right. It felt like home.'
    ],
    mediaType: 'image',
    mediaSrc: '/images/WhatsApp%20Image%202026-02-09%20at%201.08.10%20AM.jpeg',
    audioSrc: sharedAudioSrc,
    songIconSrc: '/images/8.jpeg'
  },
  {
    id: 'journey-01',
    kind: 'memory',
    chapter: 'our-journey',
    chapterLabel: chapterMeta['our-journey'].label,
    chapterNote: chapterMeta['our-journey'].note,
    theme: 'nostalgic',
    handwrittenTitle: 'Ordinary Magic',
    title: 'Our Journey',
    paragraph: [
      'The best part of us is how natural we became, step by step.',
      'Even quiet walks and unfinished talks became my favorite chapters.',
      'With you, even ordinary days carry a forever kind of warmth.'
    ],
    mediaType: 'video',
    mediaSrc: '/video/WhatsApp%20Video%202026-02-11%20at%2012.03.00%20AM.mp4',
    audioSrc: sharedAudioSrc,
    songIconSrc: '/images/7.jpeg'
  },
  {
    id: 'midway-letter',
    kind: 'letter',
    theme: 'intimate',
    lines: [
      'I do not think you realize',
      'how much calmer my world feels',
      'with you in it.'
    ]
  },
  {
    id: 'memories-01',
    kind: 'memory',
    chapter: 'best-memories-together',
    chapterLabel: chapterMeta['best-memories-together'].label,
    chapterNote: chapterMeta['best-memories-together'].note,
    theme: 'dreamy',
    handwrittenTitle: 'The Day I Knew',
    title: 'Best Memories Together',
    paragraph: [
      'There are moments with you I replay when I need light.',
      'The way you laugh, the way you listen, the way you choose us again and again.',
      'Every memory with you feels less like a picture and more like a promise.'
    ],
    mediaType: 'image',
    mediaSrc: '/images/1.jpeg',
    audioSrc: sharedAudioSrc,
    songIconSrc: '/images/6.jpeg'
  },
  {
    id: 'feelings-01',
    kind: 'memory',
    chapter: 'how-i-feel-about-you',
    chapterLabel: chapterMeta['how-i-feel-about-you'].label,
    chapterNote: chapterMeta['how-i-feel-about-you'].note,
    theme: 'intimate',
    handwrittenTitle: 'What You Are To Me',
    title: 'How I Feel About You',
    paragraph: [
      'You are peace when my mind is loud.',
      'You are courage when I am unsure, and softness when I am tired.',
      'You are the person I want beside me in every version of my future.'
    ],
    mediaType: 'image',
    mediaSrc: '/images/2.jpeg',
    audioSrc: sharedAudioSrc,
    songIconSrc: '/images/5.jpeg'
  },
  {
    id: 'favorites-01',
    kind: 'memory',
    chapter: 'your-favorites',
    chapterLabel: chapterMeta['your-favorites'].label,
    chapterNote: chapterMeta['your-favorites'].note,
    theme: 'playful',
    handwrittenTitle: 'Little Things, Big Love',
    title: 'Your Favorites',
    paragraph: [
      'I love the tiny things that make you, you.',
      'Your favorite songs, your comfort rituals, the way your eyes light up at small joys.',
      'Loving you means noticing all of it, and never getting tired of it.'
    ],
    mediaType: 'image',
    mediaSrc: '/images/3.jpeg',
    audioSrc: sharedAudioSrc,
    songIconSrc: '/images/4.jpeg'
  }
];

export const highlightWords = ['you', 'us', 'forever', 'home'];

export const themeBackground: ThemeBackgroundMap = {
  warm: 'from-[#1a110f] via-[#2e1717] to-[#12090d]',
  nostalgic: 'from-[#18121d] via-[#211833] to-[#0f101b]',
  dreamy: 'from-[#0d1721] via-[#1b2338] to-[#131625]',
  intimate: 'from-[#0a0b12] via-[#161223] to-[#090b13]',
  playful: 'from-[#11151b] via-[#1a2531] to-[#101f26]'
};

export const chapterTwoDefault: ChapterTwoConfig = {
  memories: [
    {
      id: 'hang-01',
      coverSrc: '/images/4.jpeg',
      videoSrc: '/video/WhatsApp%20Video%202026-02-11%20at%2012.03.00%20AM.mp4',
      shortMessage: 'A soft moment.',
      message: 'A memory I keep replaying in my head.'
    },
    {
      id: 'hang-02',
      coverSrc: '/images/5.jpeg',
      videoSrc: '/video/WhatsApp%20Video%202026-02-11%20at%2012.03.00%20AM.mp4',
      shortMessage: 'Still smiling here.',
      message: 'Even this ordinary moment became special with you.'
    },
    {
      id: 'hang-03',
      coverSrc: '/images/6.jpeg',
      videoSrc: '/video/WhatsApp%20Video%202026-02-11%20at%2012.03.00%20AM.mp4',
      shortMessage: 'Forever favorite.',
      message: 'The kind of day that still feels warm when I remember it.'
    }
  ],
  backgroundMusic: {
    audioSrc: sharedAudioSrc,
    autoplay: true,
    defaultVolume: 0.6
  },
  display: {
    theme: 'warm',
    introLabel: 'Chapter',
    introTitle: 'Memory Wrapped',
    introNote: "You know you my baby now, you're special to me",
    sectionTitle: 'Hanging Polaroid Memories',
    showSectionTitle: false,
    showMuteButton: false
  }
};

export const chapterThreeDefault: ChapterThreeConfig = {
  theme: 'dreamy',
  chapterLabel: 'Chapter',
  chapterTitle: 'Her World',
  chapterNote: 'Unlock the word connecting everything she loves.',
  unlockPrompt: 'Enter the word that connects all her favorites.',
  password: 'FOREVER',
  unlockMessage: 'You are my always, my safe place, my forever.',
  backgroundMusic: {
    audioSrc: sharedAudioSrc,
    autoplay: false,
    defaultVolume: 0.35,
    showToggle: true
  },
  favorites: [
    {
      id: 'fav-burnt-peanut',
      title: 'Burnt Peanut',
      imageSrc: '/images/1.jpeg',
      note: 'His goofy goop dialogue always Feels like your comfort chaos.',
      hiddenLetters: ['F'],
      order: 1
    },
    {
      id: 'fav-sidemen',
      title: 'Sidemen (Tobi)',
      imageSrc: '/images/2.jpeg',
      note: 'You glow every time Tobi shows up; it is your cOmfOrt zone.',
      hiddenLetters: ['O'],
      order: 2
    },
    {
      id: 'fav-nick-wilde',
      title: 'Nick Wilde',
      imageSrc: '/images/3.jpeg',
      note: 'That sly chaRm energy reminds me of your smile.',
      hiddenLetters: ['R'],
      order: 3
    },
    {
      id: 'fav-euphoria',
      title: 'Euphoria',
      imageSrc: '/images/4.jpeg',
      note: 'The visuals feel intEnse, messy, and strangely beautiful.',
      hiddenLetters: ['E'],
      order: 4
    },
    {
      id: 'fav-modern-family',
      title: 'Modern Family',
      imageSrc: '/images/5.jpeg',
      note: 'That show is your happy haVen after long days.',
      hiddenLetters: ['V'],
      order: 5
    },
    {
      id: 'fav-minecraft',
      title: 'Minecraft',
      imageSrc: '/images/6.jpeg',
      note: 'Even building blocks feel better when we do life togEtheR.',
      hiddenLetters: ['E', 'R'],
      order: 6
    }
  ]
};

export const chapterFourDefault: ChapterFourConfig = {
  theme: 'warm',
  chapterLabel: 'Chapter',
  chapterTitle: 'My Love',
  chapterNote: 'A letter for you.',
  letterText:
    'My love,\n\nIf I had one quiet minute with your heart, I would spend it saying thank you. Thank you for every soft moment, every patient smile, every ordinary day you turned into something unforgettable. I still find pieces of you in my routine - in songs, in empty roads, in the way evening light falls through the window. You made love feel safe for me. You made forever feel possible.\n\nI do not promise perfection. I promise presence. I promise I will keep learning you, choosing you, and protecting the peace we built together. Even when life gets loud, I will always return to this truth: loving you is the most natural thing I have ever done.\n\nIf you ever forget how deeply you are loved, read this again. And again. And again.\n\nAlways yours.',
  scrollSpeed: 14,
  backgroundImages: ['/images/1.jpeg', '/images/2.jpeg', '/images/3.jpeg', '/images/4.jpeg', '/images/5.jpeg'],
  music: {
    audioSrc: sharedAudioSrc,
    autoplay: false,
    defaultVolume: 0.35,
    showToggle: true
  },
  style: {
    overlayTint: 'rgba(10, 6, 5, 0.42)',
    envelopeColor: '#d7b79f',
    paperColor: '#f0e2cb',
    paperBorderColor: '#dbc4a7',
    letterFont: '"Times New Roman", serif'
  }
};

export const chapterFiveDefault: ChapterFiveConfig = {
  theme: 'warm',
  chapterLabel: 'Final Chapter',
  chapterTitle: 'Birthday Celebration',
  chapterNote: 'A magical little moment for your wish.',
  wishText: 'Make a Wish',
  cakeImageSrc: '/images/7.jpeg',
  candleCount: 5,
  hiddenBirthdayMessage: 'Happy Birthday, my love. May your year be gentle, bright, and full of us.',
  backgroundMusicSrc: sharedAudioSrc,
  celebrationSoundSrc: '/audio/heartbeat.mp3',
  micEnabled: true
};

export const defaultExperienceConfig: ExperienceConfig = {
  storyBlocks,
  chapterTwo: chapterTwoDefault,
  chapterThree: chapterThreeDefault,
  chapterFour: chapterFourDefault,
  chapterFive: chapterFiveDefault,
  chapterMeta,
  textStyle: {
    bodyFont: 'var(--font-sans), sans-serif',
    displayFont: 'var(--font-display), serif',
    primaryTextColor: '#f7f1ff',
    secondaryTextColor: '#d9d6df',
    accentTextColor: '#9ff6c8',
    highlightTextColor: '#b5ffd7'
  },
  highlightWords,
  themeBackground,
  introLines: ['This year did not just pass.', 'It changed me.', 'Because I met you.'],
  startButtonText: 'START OUR STORY',
  finalPrimaryLines: ['If love had a birthday,', 'it would be today.', 'Because you were born.'],
  finalSecondaryLines: ['Happy Birthday.', "Happy Valentine's.", 'Thank you for choosing me.'],
  finalLoveLine: 'I love you.',
  replayButtonText: 'REPLAY OUR YEAR',
  secretMessage: "I'm serious about us."
};
