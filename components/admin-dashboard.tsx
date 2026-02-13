"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  chapterFiveDefault,
  chapterFourDefault,
  chapterThreeDefault,
  chapterTwoDefault,
  chapterMeta,
  chapterOrder,
  defaultExperienceConfig,
  type ChapterThreeFavorite,
  type ChapterTwoMemory,
  type ExperienceConfig,
  type MidLetter,
  type MoodTheme,
  type StoryBlock,
  type StoryMemory
} from '@/data/story';

const STORAGE_KEY = 'year-with-you-config.v1';
const MOOD_THEMES: MoodTheme[] = ['warm', 'nostalgic', 'dreamy', 'intimate', 'playful'];
type ChapterKey = StoryMemory['chapter'];
const FONT_OPTIONS = [
  { label: 'Default Sans', value: 'var(--font-sans), sans-serif' },
  { label: 'Default Display', value: 'var(--font-display), serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Trebuchet', value: '"Trebuchet MS", sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' }
];

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
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultExperienceConfig;
    return parseConfig(JSON.parse(raw));
  } catch {
    return defaultExperienceConfig;
  }
}

function isMemoryBlock(block: StoryBlock): block is StoryMemory {
  return block.kind === 'memory';
}

function makeMemory(idSuffix: number): StoryMemory {
  return {
    id: `memory-${idSuffix}`,
    kind: 'memory',
    chapter: 'how-we-met',
    chapterLabel: chapterMeta['how-we-met'].label,
    chapterNote: chapterMeta['how-we-met'].note,
    theme: 'warm',
    handwrittenTitle: 'New Memory',
    title: 'New Memory Title',
    paragraph: ['Write your first line here.'],
    mediaType: 'image',
    mediaSrc: '/images/1.jpeg',
    audioSrc: '/audio/sample.mp3',
    songIconSrc: '/images/2.jpeg'
  };
}

function makeLetter(idSuffix: number): MidLetter {
  return {
    id: `letter-${idSuffix}`,
    kind: 'letter',
    theme: 'intimate',
    lines: ['Write your line here.']
  };
}

function makeChapterTwoMemory(idSuffix: number): ChapterTwoMemory {
  return {
    id: `hang-${idSuffix}`,
    coverSrc: '/images/4.jpeg',
    videoSrc: '/video/WhatsApp%20Video%202026-02-11%20at%2012.03.00%20AM.mp4',
    shortMessage: 'Small caption here.',
    message: 'Write your memory message here.'
  };
}

function makeChapterThreeFavorite(idSuffix: number): ChapterThreeFavorite {
  return {
    id: `fav-${idSuffix}`,
    title: 'New Favorite',
    imageSrc: '/images/1.jpeg',
    note: 'Write a personal line with hidden letters.',
    hiddenLetters: ['F'],
    order: idSuffix
  };
}

function moveBlock(blocks: StoryBlock[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= blocks.length) return blocks;
  const next = [...blocks];
  const temp = next[index];
  next[index] = next[nextIndex];
  next[nextIndex] = temp;
  return next;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const temp = next[index];
  next[index] = next[nextIndex];
  next[nextIndex] = temp;
  return next;
}

function moveBlockTo(blocks: StoryBlock[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return blocks;
  if (toIndex < 0 || toIndex >= blocks.length) return blocks;
  const next = [...blocks];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function linesToText(lines: string[]) {
  return lines.join('\n');
}

function textToLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AdminDashboard() {
  const [config, setConfig] = useState<ExperienceConfig>(defaultExperienceConfig);
  const [message, setMessage] = useState('');
  const [jsonDraft, setJsonDraft] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [uploadingChapter, setUploadingChapter] = useState<ChapterKey | null>(null);
  const [uploadingChapterTwo, setUploadingChapterTwo] = useState(false);
  const [chapterTargetIds, setChapterTargetIds] = useState<Partial<Record<ChapterKey, string>>>({});
  const [chapterTwoTargetId, setChapterTwoTargetId] = useState('');
  const [chapterMediaFiles, setChapterMediaFiles] = useState<Partial<Record<ChapterKey, File | null>>>({});
  const [chapterAudioFiles, setChapterAudioFiles] = useState<Partial<Record<ChapterKey, File | null>>>({});
  const [chapterIconFiles, setChapterIconFiles] = useState<Partial<Record<ChapterKey, File | null>>>({});
  const [chapterTwoCoverFile, setChapterTwoCoverFile] = useState<File | null>(null);
  const [chapterTwoVideoFile, setChapterTwoVideoFile] = useState<File | null>(null);
  const [chapterTwoMusicFile, setChapterTwoMusicFile] = useState<File | null>(null);
  const [uploadingChapterThreeImage, setUploadingChapterThreeImage] = useState(false);
  const [uploadingChapterThreeMusic, setUploadingChapterThreeMusic] = useState(false);
  const [chapterThreeTargetId, setChapterThreeTargetId] = useState('');
  const [chapterThreeImageFile, setChapterThreeImageFile] = useState<File | null>(null);
  const [chapterThreeMusicFile, setChapterThreeMusicFile] = useState<File | null>(null);
  const [uploadingChapterFourImage, setUploadingChapterFourImage] = useState(false);
  const [uploadingChapterFourMusic, setUploadingChapterFourMusic] = useState(false);
  const [chapterFourImageSlot, setChapterFourImageSlot] = useState(0);
  const [chapterFourImageFile, setChapterFourImageFile] = useState<File | null>(null);
  const [chapterFourMusicFile, setChapterFourMusicFile] = useState<File | null>(null);
  const [uploadingChapterFiveCakeImage, setUploadingChapterFiveCakeImage] = useState(false);
  const [uploadingChapterFiveMusic, setUploadingChapterFiveMusic] = useState(false);
  const [uploadingChapterFiveSfx, setUploadingChapterFiveSfx] = useState(false);
  const [chapterFiveCakeImageFile, setChapterFiveCakeImageFile] = useState<File | null>(null);
  const [chapterFiveMusicFile, setChapterFiveMusicFile] = useState<File | null>(null);
  const [chapterFiveSfxFile, setChapterFiveSfxFile] = useState<File | null>(null);

  useEffect(() => {
    const loaded = readStoredConfig();
    setConfig(loaded);
    setJsonDraft(JSON.stringify(loaded, null, 2));
  }, []);

  useEffect(() => {
    const memories = config.chapterTwo.memories || [];
    if (!memories.length) {
      setChapterTwoTargetId('');
      return;
    }

    const exists = memories.some((memory) => memory.id === chapterTwoTargetId);
    if (!exists) {
      setChapterTwoTargetId(memories[0].id);
    }
  }, [config.chapterTwo.memories, chapterTwoTargetId]);

  useEffect(() => {
    const favorites = config.chapterThree.favorites || [];
    if (!favorites.length) {
      setChapterThreeTargetId('');
      return;
    }

    const exists = favorites.some((item) => item.id === chapterThreeTargetId);
    if (!exists) {
      const first = [...favorites].sort((a, b) => a.order - b.order)[0];
      setChapterThreeTargetId(first.id);
    }
  }, [config.chapterThree.favorites, chapterThreeTargetId]);

  const memoryCount = useMemo(() => config.storyBlocks.filter((block) => block.kind === 'memory').length, [config.storyBlocks]);
  const chapterMemories = useMemo(() => {
    const groups: Record<ChapterKey, Array<{ index: number; memory: StoryMemory }>> = {
      'how-we-met': [],
      'our-journey': [],
      'best-memories-together': [],
      'how-i-feel-about-you': [],
      'your-favorites': []
    };

    config.storyBlocks.forEach((block, index) => {
      if (block.kind === 'memory') {
        groups[block.chapter].push({ index, memory: block });
      }
    });

    return groups;
  }, [config.storyBlocks]);

  function updateBlock(index: number, block: StoryBlock) {
    setConfig((prev) => {
      const storyBlocks = [...prev.storyBlocks];
      storyBlocks[index] = block;
      return { ...prev, storyBlocks };
    });
  }

  async function uploadFile({
    file,
    endpoint,
    fieldName
  }: {
    file: File;
    endpoint: '/api/upload' | '/api/upload-audio';
    fieldName: 'media' | 'audio';
  }) {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'x-admin-key': adminKey },
      body: formData
    });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error || `Upload failed (${response.status}).`);
    }

    return response.json();
  }

  async function uploadChapterAssets(chapter: ChapterKey) {
    const candidates = chapterMemories[chapter];
    const mediaFile = chapterMediaFiles[chapter];
    const audioFile = chapterAudioFiles[chapter];
    const iconFile = chapterIconFiles[chapter];

    if (!candidates.length) {
      setMessage('No memory exists in this chapter yet.');
      return;
    }

    if (!adminKey.trim()) {
      setMessage('Admin key is required for upload.');
      return;
    }

    if (!mediaFile && !audioFile && !iconFile) {
      setMessage('Pick at least one file to upload for this chapter.');
      return;
    }

    const targetId = chapterTargetIds[chapter] || candidates[0].memory.id;
    const target = candidates.find((item) => item.memory.id === targetId) || candidates[0];
    let nextMemory: StoryMemory = { ...target.memory };

    setUploadingChapter(chapter);
    setMessage('');

    try {
      if (mediaFile) {
        const uploadedMedia = await uploadFile({ file: mediaFile, endpoint: '/api/upload', fieldName: 'media' });
        nextMemory = {
          ...nextMemory,
          mediaSrc: uploadedMedia.mediaUrl || nextMemory.mediaSrc,
          mediaType: uploadedMedia.mediaType === 'video' ? 'video' : nextMemory.mediaType
        };
      }

      if (audioFile) {
        const uploadedAudio = await uploadFile({ file: audioFile, endpoint: '/api/upload-audio', fieldName: 'audio' });
        nextMemory = {
          ...nextMemory,
          audioSrc: uploadedAudio.audioUrl || nextMemory.audioSrc
        };
      }

      if (iconFile) {
        const uploadedIcon = await uploadFile({ file: iconFile, endpoint: '/api/upload', fieldName: 'media' });
        nextMemory = {
          ...nextMemory,
          songIconSrc: uploadedIcon.mediaUrl || nextMemory.songIconSrc
        };
      }

      updateBlock(target.index, nextMemory);
      setChapterMediaFiles((prev) => ({ ...prev, [chapter]: null }));
      setChapterAudioFiles((prev) => ({ ...prev, [chapter]: null }));
      setChapterIconFiles((prev) => ({ ...prev, [chapter]: null }));
      setMessage(`Uploaded and applied files to "${config.chapterMeta[chapter]?.label || chapterMeta[chapter].label}". Click Save to publish.`);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed.';
      setMessage(text);
    } finally {
      setUploadingChapter(null);
    }
  }

  function updateChapterTwoMemory(index: number, memory: ChapterTwoMemory) {
    setConfig((prev) => {
      const memories = [...prev.chapterTwo.memories];
      memories[index] = memory;
      return {
        ...prev,
        chapterTwo: {
          ...prev.chapterTwo,
          memories
        }
      };
    });
  }

  async function uploadChapterTwoAssets() {
    const memories = config.chapterTwo.memories;
    if (!memories.length) {
      setMessage('No Chapter 2 memory exists yet.');
      return;
    }

    if (!adminKey.trim()) {
      setMessage('Admin key is required for upload.');
      return;
    }

    if (!chapterTwoCoverFile && !chapterTwoVideoFile && !chapterTwoMusicFile) {
      setMessage('Pick at least one Chapter 2 file to upload.');
      return;
    }

    if (chapterTwoVideoFile && !chapterTwoVideoFile.type.startsWith('video/')) {
      setMessage('Chapter 2 video must be a real video file.');
      return;
    }

    const targetId = chapterTwoTargetId || memories[0].id;
    const targetIndex = memories.findIndex((memory) => memory.id === targetId);
    const safeTargetIndex = targetIndex >= 0 ? targetIndex : 0;
    let nextMemory = { ...memories[safeTargetIndex] };
    let nextMusicSrc = config.chapterTwo.backgroundMusic.audioSrc;

    setUploadingChapterTwo(true);
    setMessage('');

    try {
      if (chapterTwoCoverFile) {
        const uploadedCover = await uploadFile({ file: chapterTwoCoverFile, endpoint: '/api/upload', fieldName: 'media' });
        nextMemory = {
          ...nextMemory,
          coverSrc: uploadedCover.mediaUrl || nextMemory.coverSrc
        };
      }

      if (chapterTwoVideoFile) {
        const uploadedVideo = await uploadFile({ file: chapterTwoVideoFile, endpoint: '/api/upload', fieldName: 'media' });
        if (uploadedVideo.mediaType !== 'video') {
          throw new Error('Selected Chapter 2 video file is not a valid video.');
        }
        nextMemory = {
          ...nextMemory,
          videoSrc: uploadedVideo.mediaUrl || nextMemory.videoSrc
        };
      }

      if (chapterTwoMusicFile) {
        const uploadedMusic = await uploadFile({ file: chapterTwoMusicFile, endpoint: '/api/upload-audio', fieldName: 'audio' });
        nextMusicSrc = uploadedMusic.audioUrl || nextMusicSrc;
      }

      setConfig((prev) => {
        const updatedMemories = [...prev.chapterTwo.memories];
        updatedMemories[safeTargetIndex] = nextMemory;
        return {
          ...prev,
          chapterTwo: {
            ...prev.chapterTwo,
            memories: updatedMemories,
            backgroundMusic: {
              ...prev.chapterTwo.backgroundMusic,
              audioSrc: nextMusicSrc
            }
          }
        };
      });

      setChapterTwoCoverFile(null);
      setChapterTwoVideoFile(null);
      setChapterTwoMusicFile(null);
      setMessage('Chapter 2 uploads applied. Click Save to publish.');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed.';
      setMessage(text);
    } finally {
      setUploadingChapterTwo(false);
    }
  }

  function updateChapterThreeFavorite(index: number, favorite: ChapterThreeFavorite) {
    setConfig((prev) => {
      const favorites = [...prev.chapterThree.favorites];
      favorites[index] = favorite;
      return {
        ...prev,
        chapterThree: {
          ...prev.chapterThree,
          favorites
        }
      };
    });
  }

  async function uploadChapterThreeImage() {
    const favorites = [...config.chapterThree.favorites].sort((a, b) => a.order - b.order);
    if (!favorites.length) {
      setMessage('No Chapter 3 favorite exists yet.');
      return;
    }

    if (!adminKey.trim()) {
      setMessage('Admin key is required for upload.');
      return;
    }

    if (!chapterThreeImageFile) {
      setMessage('Pick an image file for Chapter 3.');
      return;
    }

    if (!chapterThreeImageFile.type.startsWith('image/')) {
      setMessage('Chapter 3 upload must be an image.');
      return;
    }

    const targetId = chapterThreeTargetId || favorites[0].id;
    const targetIndex = config.chapterThree.favorites.findIndex((item) => item.id === targetId);
    if (targetIndex < 0) {
      setMessage('Target Chapter 3 item not found.');
      return;
    }

    setUploadingChapterThreeImage(true);
    setMessage('');

    try {
      const uploaded = await uploadFile({ file: chapterThreeImageFile, endpoint: '/api/upload', fieldName: 'media' });
      if (uploaded.mediaType !== 'image') {
        throw new Error('Selected file is not a valid image.');
      }

      setConfig((prev) => {
        const nextFavorites = [...prev.chapterThree.favorites];
        nextFavorites[targetIndex] = {
          ...nextFavorites[targetIndex],
          imageSrc: uploaded.mediaUrl || nextFavorites[targetIndex].imageSrc
        };
        return {
          ...prev,
          chapterThree: {
            ...prev.chapterThree,
            favorites: nextFavorites
          }
        };
      });

      setChapterThreeImageFile(null);
      setMessage('Chapter 3 image applied. Click Save to publish.');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed.';
      setMessage(text);
    } finally {
      setUploadingChapterThreeImage(false);
    }
  }

  async function uploadChapterThreeMusic() {
    if (!adminKey.trim()) {
      setMessage('Admin key is required for upload.');
      return;
    }

    if (!chapterThreeMusicFile) {
      setMessage('Pick a Chapter 3 music file.');
      return;
    }

    if (!chapterThreeMusicFile.type.startsWith('audio/')) {
      setMessage('Chapter 3 music upload must be audio.');
      return;
    }

    setUploadingChapterThreeMusic(true);
    setMessage('');

    try {
      const uploaded = await uploadFile({ file: chapterThreeMusicFile, endpoint: '/api/upload-audio', fieldName: 'audio' });
      setConfig((prev) => ({
        ...prev,
        chapterThree: {
          ...prev.chapterThree,
          backgroundMusic: {
            ...prev.chapterThree.backgroundMusic,
            audioSrc: uploaded.audioUrl || prev.chapterThree.backgroundMusic.audioSrc
          }
        }
      }));
      setChapterThreeMusicFile(null);
      setMessage('Chapter 3 music applied. Click Save to publish.');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed.';
      setMessage(text);
    } finally {
      setUploadingChapterThreeMusic(false);
    }
  }

  async function uploadChapterFourImage() {
    if (!adminKey.trim()) {
      setMessage('Admin key is required for upload.');
      return;
    }

    if (!chapterFourImageFile) {
      setMessage('Pick a Chapter 4 image file.');
      return;
    }

    if (!chapterFourImageFile.type.startsWith('image/')) {
      setMessage('Chapter 4 background upload must be an image.');
      return;
    }

    setUploadingChapterFourImage(true);
    setMessage('');

    try {
      const uploaded = await uploadFile({ file: chapterFourImageFile, endpoint: '/api/upload', fieldName: 'media' });
      if (uploaded.mediaType !== 'image') {
        throw new Error('Selected file is not a valid image.');
      }

      setConfig((prev) => {
        const nextImages = [...(prev.chapterFour.backgroundImages || [])];
        while (nextImages.length < 5) nextImages.push('');
        const safeIndex = Math.max(0, Math.min(chapterFourImageSlot, nextImages.length - 1));
        nextImages[safeIndex] = uploaded.mediaUrl || nextImages[safeIndex];
        return {
          ...prev,
          chapterFour: {
            ...prev.chapterFour,
            backgroundImages: nextImages
          }
        };
      });

      setChapterFourImageFile(null);
      setMessage('Chapter 4 background image applied. Click Save to publish.');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed.';
      setMessage(text);
    } finally {
      setUploadingChapterFourImage(false);
    }
  }

  async function uploadChapterFourMusic() {
    if (!adminKey.trim()) {
      setMessage('Admin key is required for upload.');
      return;
    }

    if (!chapterFourMusicFile) {
      setMessage('Pick a Chapter 4 music file.');
      return;
    }

    if (!chapterFourMusicFile.type.startsWith('audio/')) {
      setMessage('Chapter 4 music upload must be audio.');
      return;
    }

    setUploadingChapterFourMusic(true);
    setMessage('');

    try {
      const uploaded = await uploadFile({ file: chapterFourMusicFile, endpoint: '/api/upload-audio', fieldName: 'audio' });
      setConfig((prev) => ({
        ...prev,
        chapterFour: {
          ...prev.chapterFour,
          music: {
            ...prev.chapterFour.music,
            audioSrc: uploaded.audioUrl || prev.chapterFour.music.audioSrc
          }
        }
      }));
      setChapterFourMusicFile(null);
      setMessage('Chapter 4 music applied. Click Save to publish.');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed.';
      setMessage(text);
    } finally {
      setUploadingChapterFourMusic(false);
    }
  }

  async function uploadChapterFiveCakeImage() {
    if (!adminKey.trim()) {
      setMessage('Admin key is required for upload.');
      return;
    }
    if (!chapterFiveCakeImageFile) {
      setMessage('Pick a Chapter 5 cake image file.');
      return;
    }
    if (!chapterFiveCakeImageFile.type.startsWith('image/')) {
      setMessage('Cake design upload must be an image.');
      return;
    }

    setUploadingChapterFiveCakeImage(true);
    setMessage('');
    try {
      const uploaded = await uploadFile({ file: chapterFiveCakeImageFile, endpoint: '/api/upload', fieldName: 'media' });
      if (uploaded.mediaType !== 'image') {
        throw new Error('Selected file is not a valid image.');
      }
      setConfig((prev) => ({
        ...prev,
        chapterFive: {
          ...prev.chapterFive,
          cakeImageSrc: uploaded.mediaUrl || prev.chapterFive.cakeImageSrc
        }
      }));
      setChapterFiveCakeImageFile(null);
      setMessage('Chapter 5 cake image applied. Click Save to publish.');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed.';
      setMessage(text);
    } finally {
      setUploadingChapterFiveCakeImage(false);
    }
  }

  async function uploadChapterFiveMusic() {
    if (!adminKey.trim()) {
      setMessage('Admin key is required for upload.');
      return;
    }
    if (!chapterFiveMusicFile) {
      setMessage('Pick a Chapter 5 background music file.');
      return;
    }
    if (!chapterFiveMusicFile.type.startsWith('audio/')) {
      setMessage('Chapter 5 background music must be audio.');
      return;
    }

    setUploadingChapterFiveMusic(true);
    setMessage('');
    try {
      const uploaded = await uploadFile({ file: chapterFiveMusicFile, endpoint: '/api/upload-audio', fieldName: 'audio' });
      setConfig((prev) => ({
        ...prev,
        chapterFive: {
          ...prev.chapterFive,
          backgroundMusicSrc: uploaded.audioUrl || prev.chapterFive.backgroundMusicSrc
        }
      }));
      setChapterFiveMusicFile(null);
      setMessage('Chapter 5 music applied. Click Save to publish.');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed.';
      setMessage(text);
    } finally {
      setUploadingChapterFiveMusic(false);
    }
  }

  async function uploadChapterFiveSfx() {
    if (!adminKey.trim()) {
      setMessage('Admin key is required for upload.');
      return;
    }
    if (!chapterFiveSfxFile) {
      setMessage('Pick a Chapter 5 celebration sound file.');
      return;
    }
    if (!chapterFiveSfxFile.type.startsWith('audio/')) {
      setMessage('Chapter 5 celebration sound must be audio.');
      return;
    }

    setUploadingChapterFiveSfx(true);
    setMessage('');
    try {
      const uploaded = await uploadFile({ file: chapterFiveSfxFile, endpoint: '/api/upload-audio', fieldName: 'audio' });
      setConfig((prev) => ({
        ...prev,
        chapterFive: {
          ...prev.chapterFive,
          celebrationSoundSrc: uploaded.audioUrl || prev.chapterFive.celebrationSoundSrc
        }
      }));
      setChapterFiveSfxFile(null);
      setMessage('Chapter 5 celebration sound applied. Click Save to publish.');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed.';
      setMessage(text);
    } finally {
      setUploadingChapterFiveSfx(false);
    }
  }

  function saveConfig() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new Event('year-with-you-config-updated'));
      setJsonDraft(JSON.stringify(config, null, 2));
      setMessage('Saved. Your layout/content settings are now live on the main page.');
    } catch {
      setMessage('Could not save config.');
    }
  }

  function resetToDefault() {
    setConfig(defaultExperienceConfig);
    setJsonDraft(JSON.stringify(defaultExperienceConfig, null, 2));
    setMessage('Reset to default values. Click Save to apply.');
  }

  function applyJson() {
    try {
      const parsed = parseConfig(JSON.parse(jsonDraft));
      setConfig(parsed);
      setMessage('JSON applied. Click Save to make it live.');
    } catch {
      setMessage('Invalid JSON. Please fix syntax and try again.');
    }
  }

  function exportJson() {
    setJsonDraft(JSON.stringify(config, null, 2));
    setMessage('JSON refreshed. You can copy it from the box below.');
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h1 className="text-3xl md:text-4xl">Layout Admin</h1>
          <p className="mt-2 text-sm text-white/70">
            Control order, media, music, backgrounds, icon, paragraphs, and overall story layout.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={saveConfig} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black">
              Save
            </button>
            <button type="button" onClick={resetToDefault} className="rounded-lg border border-white/20 px-4 py-2 text-sm">
              Reset Defaults
            </button>
            <button type="button" onClick={exportJson} className="rounded-lg border border-white/20 px-4 py-2 text-sm">
              Refresh JSON
            </button>
          </div>
          {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
        </header>

        <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-2xl">Global Settings</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Body Font</span>
              <select
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                value={config.textStyle.bodyFont}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, bodyFont: e.target.value }
                  }))
                }
              >
                {FONT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Display Font</span>
              <select
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                value={config.textStyle.displayFont}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, displayFont: e.target.value }
                  }))
                }
              >
                {FONT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Primary Text Color</span>
              <input
                type="color"
                className="h-10 w-full rounded-lg border border-white/20 bg-black/30 px-2 py-1"
                value={config.textStyle.primaryTextColor}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, primaryTextColor: e.target.value }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Secondary Text Color</span>
              <input
                type="color"
                className="h-10 w-full rounded-lg border border-white/20 bg-black/30 px-2 py-1"
                value={config.textStyle.secondaryTextColor}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, secondaryTextColor: e.target.value }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Accent Text Color</span>
              <input
                type="color"
                className="h-10 w-full rounded-lg border border-white/20 bg-black/30 px-2 py-1"
                value={config.textStyle.accentTextColor}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, accentTextColor: e.target.value }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Highlight Text Color</span>
              <input
                type="color"
                className="h-10 w-full rounded-lg border border-white/20 bg-black/30 px-2 py-1"
                value={config.textStyle.highlightTextColor}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, highlightTextColor: e.target.value }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Highlight Words (comma separated)</span>
              <input
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                value={config.highlightWords.join(', ')}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    highlightWords: e.target.value
                      .split(',')
                      .map((word) => word.trim().toLowerCase())
                      .filter(Boolean)
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Start Button Text</span>
              <input
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                value={config.startButtonText}
                onChange={(e) => setConfig((prev) => ({ ...prev, startButtonText: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Intro Lines (one per line)</span>
              <textarea
                className="h-28 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                value={linesToText(config.introLines)}
                onChange={(e) => setConfig((prev) => ({ ...prev, introLines: textToLines(e.target.value) }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Secret Message</span>
              <textarea
                className="h-28 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                value={config.secretMessage}
                onChange={(e) => setConfig((prev) => ({ ...prev, secretMessage: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Final Main Lines (one per line)</span>
              <textarea
                className="h-28 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                value={linesToText(config.finalPrimaryLines)}
                onChange={(e) => setConfig((prev) => ({ ...prev, finalPrimaryLines: textToLines(e.target.value) }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Final Secondary Lines (one per line)</span>
              <textarea
                className="h-28 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                value={linesToText(config.finalSecondaryLines)}
                onChange={(e) => setConfig((prev) => ({ ...prev, finalSecondaryLines: textToLines(e.target.value) }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Final Love Line</span>
              <input
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                value={config.finalLoveLine}
                onChange={(e) => setConfig((prev) => ({ ...prev, finalLoveLine: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Replay Button Text</span>
              <input
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                value={config.replayButtonText}
                onChange={(e) => setConfig((prev) => ({ ...prev, replayButtonText: e.target.value }))}
              />
            </label>
          </div>

          <h3 className="mt-6 text-lg">Chapter Name and Title Below</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {chapterOrder.map((chapter) => (
              <article key={chapter} className="rounded-lg border border-white/15 bg-black/35 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">{chapter}</p>
                <label className="mt-2 block">
                  <span className="mb-1 block text-xs text-white/70">Chapter Name</span>
                  <input
                    className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                    value={config.chapterMeta[chapter]?.label || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        chapterMeta: {
                          ...prev.chapterMeta,
                          [chapter]: {
                            ...(prev.chapterMeta[chapter] || defaultExperienceConfig.chapterMeta[chapter]),
                            label: e.target.value
                          }
                        }
                      }))
                    }
                  />
                </label>
                <label className="mt-2 block">
                  <span className="mb-1 block text-xs text-white/70">Title Below Chapter</span>
                  <textarea
                    className="h-20 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                    value={config.chapterMeta[chapter]?.note || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        chapterMeta: {
                          ...prev.chapterMeta,
                          [chapter]: {
                            ...(prev.chapterMeta[chapter] || defaultExperienceConfig.chapterMeta[chapter]),
                            note: e.target.value
                          }
                        }
                      }))
                    }
                  />
                </label>
              </article>
            ))}
          </div>

          <h3 className="mt-6 text-lg">Background Gradients by Theme</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {MOOD_THEMES.map((theme) => (
              <label key={theme} className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">{theme}</span>
                <input
                  className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                  value={config.themeBackground[theme]}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      themeBackground: {
                        ...prev.themeBackground,
                        [theme]: e.target.value
                      }
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-2xl">Chapter Uploads</h2>
          <p className="mt-2 text-sm text-white/65">Each chapter has its own upload option for media, music, and player icon.</p>
          <label className="mt-4 block max-w-sm">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Admin Key</span>
            <input
              type="password"
              className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key for uploads"
            />
          </label>

          <div className="mt-4 grid gap-4">
            {chapterOrder.map((chapter) => {
              const memories = chapterMemories[chapter];
              const currentTargetId = chapterTargetIds[chapter] || memories[0]?.memory.id || '';
              return (
                <article key={chapter} className="rounded-xl border border-white/15 bg-black/40 p-4">
                  <h3 className="text-lg">{config.chapterMeta[chapter]?.label || chapterMeta[chapter].label}</h3>
                  <p className="text-xs text-white/60">{memories.length} memory block(s) in this chapter</p>

                  {memories.length === 0 ? (
                    <p className="mt-3 text-sm text-amber-300">No memory in this chapter yet. Add one below first.</p>
                  ) : (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="block md:col-span-2">
                        <span className="mb-1 block text-xs text-white/70">Target Memory</span>
                        <select
                          className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                          value={currentTargetId}
                          onChange={(e) => setChapterTargetIds((prev) => ({ ...prev, [chapter]: e.target.value }))}
                        >
                          {memories.map((item) => (
                            <option key={item.memory.id} value={item.memory.id}>
                              {item.memory.title} ({item.memory.id})
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-white/70">Upload Media (image/video)</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                          onChange={(e) => setChapterMediaFiles((prev) => ({ ...prev, [chapter]: e.target.files?.[0] || null }))}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-white/70">Upload Music (audio)</span>
                        <input
                          type="file"
                          accept="audio/*"
                          className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                          onChange={(e) => setChapterAudioFiles((prev) => ({ ...prev, [chapter]: e.target.files?.[0] || null }))}
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="mb-1 block text-xs text-white/70">Upload Music Player Icon</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                          onChange={(e) => setChapterIconFiles((prev) => ({ ...prev, [chapter]: e.target.files?.[0] || null }))}
                        />
                      </label>
                      <div className="md:col-span-2">
                        <button
                          type="button"
                          className="rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                          disabled={uploadingChapter === chapter}
                          onClick={() => uploadChapterAssets(chapter)}
                        >
                          {uploadingChapter === chapter ? 'Uploading...' : 'Upload to This Chapter'}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl">Chapter 2 - Hanging Polaroids</h2>
            <button
              type="button"
              className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-black"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  chapterTwo: {
                    ...prev.chapterTwo,
                    memories: [...prev.chapterTwo.memories, makeChapterTwoMemory(prev.chapterTwo.memories.length + 1)]
                  }
                }))
              }
            >
              Add Polaroid
            </button>
          </div>
          <p className="mt-2 text-sm text-white/65">Full Chapter 2 control: intro page text/theme, hanging section look, memories, and one background music.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter 2 Theme</span>
              <select
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterTwo.display.theme}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterTwo: {
                      ...prev.chapterTwo,
                      display: {
                        ...prev.chapterTwo.display,
                        theme: e.target.value as MoodTheme
                      }
                    }
                  }))
                }
              >
                {MOOD_THEMES.map((theme) => (
                  <option key={`chapter-two-theme-${theme}`} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Intro Label (top small text)</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterTwo.display.introLabel}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterTwo: {
                      ...prev.chapterTwo,
                      display: {
                        ...prev.chapterTwo.display,
                        introLabel: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Intro Title (chapter name)</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterTwo.display.introTitle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterTwo: {
                      ...prev.chapterTwo,
                      display: {
                        ...prev.chapterTwo.display,
                        introTitle: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Intro Subtitle</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterTwo.display.introNote}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterTwo: {
                      ...prev.chapterTwo,
                      display: {
                        ...prev.chapterTwo.display,
                        introNote: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Polaroid Section Title</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterTwo.display.sectionTitle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterTwo: {
                      ...prev.chapterTwo,
                      display: {
                        ...prev.chapterTwo.display,
                        sectionTitle: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Background Music Source</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                value={config.chapterTwo.backgroundMusic.audioSrc}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterTwo: {
                      ...prev.chapterTwo,
                      backgroundMusic: {
                        ...prev.chapterTwo.backgroundMusic,
                        audioSrc: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Default Volume (0 to 1)</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterTwo.backgroundMusic.defaultVolume}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterTwo: {
                      ...prev.chapterTwo,
                      backgroundMusic: {
                        ...prev.chapterTwo.backgroundMusic,
                        defaultVolume: Number(e.target.value)
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-white/85">
              <input
                type="checkbox"
                checked={config.chapterTwo.backgroundMusic.autoplay}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterTwo: {
                      ...prev.chapterTwo,
                      backgroundMusic: {
                        ...prev.chapterTwo.backgroundMusic,
                        autoplay: e.target.checked
                      }
                    }
                  }))
                }
              />
              Autoplay music when entering Chapter 2
            </label>
            <label className="flex items-center gap-3 text-sm text-white/85">
              <input
                type="checkbox"
                checked={config.chapterTwo.display.showSectionTitle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterTwo: {
                      ...prev.chapterTwo,
                      display: {
                        ...prev.chapterTwo.display,
                        showSectionTitle: e.target.checked
                      }
                    }
                  }))
                }
              />
              Show title on polaroid section
            </label>
            <label className="flex items-center gap-3 text-sm text-white/85">
              <input
                type="checkbox"
                checked={config.chapterTwo.display.showMuteButton}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterTwo: {
                      ...prev.chapterTwo,
                      display: {
                        ...prev.chapterTwo.display,
                        showMuteButton: e.target.checked
                      }
                    }
                  }))
                }
              />
              Show mute/unmute button
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-white/15 bg-black/35 p-4">
            <h3 className="text-lg">Chapter 2 Uploads</h3>
            <p className="mt-1 text-xs text-white/60">Upload cover/video to a selected polaroid, and upload one background music file.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs text-white/70">Target Polaroid</span>
                <select
                  className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                  value={chapterTwoTargetId}
                  onChange={(e) => setChapterTwoTargetId(e.target.value)}
                  disabled={!config.chapterTwo.memories.length}
                >
                  {config.chapterTwo.memories.map((memory) => (
                    <option key={memory.id} value={memory.id}>
                      {memory.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-white/70">Upload Cover Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                  onChange={(e) => setChapterTwoCoverFile(e.target.files?.[0] || null)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-white/70">Upload Video File</span>
                <input
                  type="file"
                  accept="video/*"
                  className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                  onChange={(e) => setChapterTwoVideoFile(e.target.files?.[0] || null)}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs text-white/70">Upload Chapter 2 Background Music</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                  onChange={(e) => setChapterTwoMusicFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <button
              type="button"
              className="mt-4 rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
              onClick={uploadChapterTwoAssets}
              disabled={uploadingChapterTwo}
            >
              {uploadingChapterTwo ? 'Uploading...' : 'Upload Chapter 2 Assets'}
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {config.chapterTwo.memories.map((memory, index) => (
              <article key={`${memory.id}-${index}`} className="rounded-xl border border-white/15 bg-black/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                    {index + 1}. polaroid
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded border border-white/20 px-2 py-1 text-xs"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          chapterTwo: {
                            ...prev.chapterTwo,
                            memories: moveItem(prev.chapterTwo.memories, index, -1)
                          }
                        }))
                      }
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="rounded border border-white/20 px-2 py-1 text-xs"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          chapterTwo: {
                            ...prev.chapterTwo,
                            memories: moveItem(prev.chapterTwo.memories, index, 1)
                          }
                        }))
                      }
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="rounded border border-rose-400/50 px-2 py-1 text-xs text-rose-300"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          chapterTwo: {
                            ...prev.chapterTwo,
                            memories: prev.chapterTwo.memories.filter((_, currentIndex) => currentIndex !== index)
                          }
                        }))
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs text-white/70">ID</span>
                    <input
                      className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                      value={memory.id}
                      onChange={(e) => updateChapterTwoMemory(index, { ...memory, id: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-white/70">Cover Image URL</span>
                    <input
                      className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                      value={memory.coverSrc}
                      onChange={(e) => updateChapterTwoMemory(index, { ...memory, coverSrc: e.target.value })}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-xs text-white/70">Video URL</span>
                    <input
                      className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                      value={memory.videoSrc}
                      onChange={(e) => updateChapterTwoMemory(index, { ...memory, videoSrc: e.target.value })}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-xs text-white/70">Small Polaroid Caption</span>
                    <input
                      className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                      value={memory.shortMessage || ''}
                      onChange={(e) => updateChapterTwoMemory(index, { ...memory, shortMessage: e.target.value })}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-xs text-white/70">Modal Message</span>
                    <textarea
                      className="h-24 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                      value={memory.message}
                      onChange={(e) => updateChapterTwoMemory(index, { ...memory, message: e.target.value })}
                    />
                  </label>
                </div>
              </article>
            ))}
            {!config.chapterTwo.memories.length ? <p className="text-sm text-amber-300">No Chapter 2 memories yet. Add one.</p> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl">Chapter 3 - Her World</h2>
            <button
              type="button"
              className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-black"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  chapterThree: {
                    ...prev.chapterThree,
                    favorites: [...prev.chapterThree.favorites, makeChapterThreeFavorite(prev.chapterThree.favorites.length + 1)]
                  }
                }))
              }
            >
              Add Favorite
            </button>
          </div>
          <p className="mt-2 text-sm text-white/65">Manage cards, hidden letters, unlock password, and final unlocked message.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter 3 Theme</span>
              <select
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterThree.theme}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      theme: e.target.value as MoodTheme
                    }
                  }))
                }
              >
                {MOOD_THEMES.map((theme) => (
                  <option key={`chapter-three-theme-${theme}`} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter Label</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterThree.chapterLabel}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      chapterLabel: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter Title</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterThree.chapterTitle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      chapterTitle: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter Subtitle</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterThree.chapterNote}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      chapterNote: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Unlock Prompt</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterThree.unlockPrompt}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      unlockPrompt: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Final Password</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterThree.password}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      password: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Final Unlock Message</span>
              <textarea
                className="h-24 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterThree.unlockMessage}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      unlockMessage: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Background Music Source</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                value={config.chapterThree.backgroundMusic.audioSrc}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      backgroundMusic: {
                        ...prev.chapterThree.backgroundMusic,
                        audioSrc: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Default Volume (0 to 1)</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterThree.backgroundMusic.defaultVolume}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      backgroundMusic: {
                        ...prev.chapterThree.backgroundMusic,
                        defaultVolume: Number(e.target.value)
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-white/85">
              <input
                type="checkbox"
                checked={config.chapterThree.backgroundMusic.autoplay}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      backgroundMusic: {
                        ...prev.chapterThree.backgroundMusic,
                        autoplay: e.target.checked
                      }
                    }
                  }))
                }
              />
              Autoplay Chapter 3 music
            </label>
            <label className="flex items-center gap-3 text-sm text-white/85">
              <input
                type="checkbox"
                checked={config.chapterThree.backgroundMusic.showToggle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterThree: {
                      ...prev.chapterThree,
                      backgroundMusic: {
                        ...prev.chapterThree.backgroundMusic,
                        showToggle: e.target.checked
                      }
                    }
                  }))
                }
              />
              Show mute/unmute button
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-white/15 bg-black/35 p-4">
            <h3 className="text-lg">Chapter 3 Music Upload</h3>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs text-white/70">Upload Music File</span>
              <input
                type="file"
                accept="audio/*"
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                onChange={(e) => setChapterThreeMusicFile(e.target.files?.[0] || null)}
              />
            </label>
            <button
              type="button"
              className="mt-4 rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
              onClick={uploadChapterThreeMusic}
              disabled={uploadingChapterThreeMusic}
            >
              {uploadingChapterThreeMusic ? 'Uploading...' : 'Upload Chapter 3 Music'}
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-white/15 bg-black/35 p-4">
            <h3 className="text-lg">Chapter 3 Image Upload</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-white/70">Target Favorite</span>
                <select
                  className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                  value={chapterThreeTargetId}
                  onChange={(e) => setChapterThreeTargetId(e.target.value)}
                  disabled={!config.chapterThree.favorites.length}
                >
                  {[...config.chapterThree.favorites]
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <option key={`chapter-three-upload-${item.id}`} value={item.id}>
                        {item.title} ({item.id})
                      </option>
                    ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-white/70">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                  onChange={(e) => setChapterThreeImageFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <button
              type="button"
              className="mt-4 rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
              onClick={uploadChapterThreeImage}
              disabled={uploadingChapterThreeImage}
            >
              {uploadingChapterThreeImage ? 'Uploading...' : 'Upload Chapter 3 Image'}
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {[...config.chapterThree.favorites]
              .sort((a, b) => a.order - b.order)
              .map((item, idx, sorted) => {
                const currentIndex = config.chapterThree.favorites.findIndex((entry) => entry.id === item.id);
                return (
                  <article key={`${item.id}-${idx}`} className="rounded-xl border border-white/15 bg-black/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                        {idx + 1}. favorite card
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded border border-white/20 px-2 py-1 text-xs"
                          onClick={() => {
                            if (idx === 0) return;
                            const nextSorted = [...sorted];
                            const temp = nextSorted[idx - 1];
                            nextSorted[idx - 1] = nextSorted[idx];
                            nextSorted[idx] = temp;
                            setConfig((prev) => ({
                              ...prev,
                              chapterThree: {
                                ...prev.chapterThree,
                                favorites: prev.chapterThree.favorites.map((favorite) => {
                                  const pos = nextSorted.findIndex((entry) => entry.id === favorite.id);
                                  return { ...favorite, order: pos + 1 };
                                })
                              }
                            }));
                          }}
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          className="rounded border border-white/20 px-2 py-1 text-xs"
                          onClick={() => {
                            if (idx >= sorted.length - 1) return;
                            const nextSorted = [...sorted];
                            const temp = nextSorted[idx + 1];
                            nextSorted[idx + 1] = nextSorted[idx];
                            nextSorted[idx] = temp;
                            setConfig((prev) => ({
                              ...prev,
                              chapterThree: {
                                ...prev.chapterThree,
                                favorites: prev.chapterThree.favorites.map((favorite) => {
                                  const pos = nextSorted.findIndex((entry) => entry.id === favorite.id);
                                  return { ...favorite, order: pos + 1 };
                                })
                              }
                            }));
                          }}
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          className="rounded border border-rose-400/50 px-2 py-1 text-xs text-rose-300"
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              chapterThree: {
                                ...prev.chapterThree,
                                favorites: prev.chapterThree.favorites.filter((favorite) => favorite.id !== item.id)
                              }
                            }))
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-xs text-white/70">ID</span>
                        <input
                          className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                          value={item.id}
                          onChange={(e) => currentIndex >= 0 && updateChapterThreeFavorite(currentIndex, { ...item, id: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-white/70">Title</span>
                        <input
                          className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                          value={item.title}
                          onChange={(e) => currentIndex >= 0 && updateChapterThreeFavorite(currentIndex, { ...item, title: e.target.value })}
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="mb-1 block text-xs text-white/70">Image URL</span>
                        <input
                          className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                          value={item.imageSrc}
                          onChange={(e) => currentIndex >= 0 && updateChapterThreeFavorite(currentIndex, { ...item, imageSrc: e.target.value })}
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="mb-1 block text-xs text-white/70">Card Note</span>
                        <textarea
                          className="h-24 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                          value={item.note}
                          onChange={(e) => currentIndex >= 0 && updateChapterThreeFavorite(currentIndex, { ...item, note: e.target.value })}
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="mb-1 block text-xs text-white/70">Hidden Letters (comma separated)</span>
                        <input
                          className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                          value={(item.hiddenLetters || []).join(', ')}
                          onChange={(e) =>
                            currentIndex >= 0 &&
                            updateChapterThreeFavorite(currentIndex, {
                              ...item,
                              hiddenLetters: e.target.value
                                .split(',')
                                .map((letter) => letter.trim().toUpperCase())
                                .filter(Boolean)
                            })
                          }
                        />
                      </label>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-2xl">Chapter 4 - My Love</h2>
          <p className="mt-2 text-sm text-white/65">Cinematic letter scene with floating images, envelope animation, and auto-scrolling love letter.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter 4 Theme</span>
              <select
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFour.theme}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      theme: e.target.value as MoodTheme
                    }
                  }))
                }
              >
                {MOOD_THEMES.map((theme) => (
                  <option key={`chapter-four-theme-${theme}`} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter Label</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFour.chapterLabel}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      chapterLabel: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter Title</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFour.chapterTitle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      chapterTitle: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter Subtitle</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFour.chapterNote}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      chapterNote: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Letter Scroll Speed (px/s)</span>
              <input
                type="number"
                min={4}
                max={40}
                step={1}
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFour.scrollSpeed}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      scrollSpeed: Number(e.target.value)
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Letter Font CSS Value</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFour.style.letterFont}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      style: {
                        ...prev.chapterFour.style,
                        letterFont: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Full Letter Paragraph</span>
              <textarea
                className="h-56 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFour.letterText}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      letterText: e.target.value
                    }
                  }))
                }
              />
            </label>
          </div>

          <h3 className="mt-6 text-lg">Chapter 4 Music</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Music Source</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                value={config.chapterFour.music.audioSrc}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      music: {
                        ...prev.chapterFour.music,
                        audioSrc: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Default Volume (0 to 1)</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFour.music.defaultVolume}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      music: {
                        ...prev.chapterFour.music,
                        defaultVolume: Number(e.target.value)
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-white/85">
              <input
                type="checkbox"
                checked={config.chapterFour.music.autoplay}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      music: {
                        ...prev.chapterFour.music,
                        autoplay: e.target.checked
                      }
                    }
                  }))
                }
              />
              Autoplay Chapter 4 music
            </label>
            <label className="flex items-center gap-3 text-sm text-white/85">
              <input
                type="checkbox"
                checked={config.chapterFour.music.showToggle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      music: {
                        ...prev.chapterFour.music,
                        showToggle: e.target.checked
                      }
                    }
                  }))
                }
              />
              Show mute/unmute button
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs text-white/70">Upload Chapter 4 Music</span>
              <input
                type="file"
                accept="audio/*"
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                onChange={(e) => setChapterFourMusicFile(e.target.files?.[0] || null)}
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="button"
                className="rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                onClick={uploadChapterFourMusic}
                disabled={uploadingChapterFourMusic}
              >
                {uploadingChapterFourMusic ? 'Uploading...' : 'Upload Chapter 4 Music'}
              </button>
            </div>
          </div>

          <h3 className="mt-6 text-lg">Floating Background Images</h3>
          <div className="mt-3 space-y-3">
            {[0, 1, 2, 3, 4].map((slot) => (
              <label key={`chapter-four-image-slot-${slot}`} className="block">
                <span className="mb-1 block text-xs text-white/70">Image Slot {slot + 1}</span>
                <input
                  className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                  value={config.chapterFour.backgroundImages[slot] || ''}
                  onChange={(e) =>
                    setConfig((prev) => {
                      const nextImages = [...(prev.chapterFour.backgroundImages || [])];
                      while (nextImages.length < 5) nextImages.push('');
                      nextImages[slot] = e.target.value;
                      return {
                        ...prev,
                        chapterFour: {
                          ...prev.chapterFour,
                          backgroundImages: nextImages
                        }
                      };
                    })
                  }
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-white/70">Upload Target Slot</span>
              <select
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={chapterFourImageSlot}
                onChange={(e) => setChapterFourImageSlot(Number(e.target.value))}
              >
                {[0, 1, 2, 3, 4].map((slot) => (
                  <option key={`chapter-four-upload-slot-${slot}`} value={slot}>
                    Slot {slot + 1}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-white/70">Upload Chapter 4 Image</span>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                onChange={(e) => setChapterFourImageFile(e.target.files?.[0] || null)}
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="button"
                className="rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                onClick={uploadChapterFourImage}
                disabled={uploadingChapterFourImage}
              >
                {uploadingChapterFourImage ? 'Uploading...' : 'Upload Chapter 4 Background Image'}
              </button>
            </div>
          </div>

          <h3 className="mt-6 text-lg">Envelope and Paper Styling</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Overlay Tint (rgba)</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                value={config.chapterFour.style.overlayTint}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      style: {
                        ...prev.chapterFour.style,
                        overlayTint: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Envelope Color</span>
              <input
                className="h-10 w-full rounded border border-white/20 bg-black/30 px-2 py-1"
                type="color"
                value={config.chapterFour.style.envelopeColor}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      style: {
                        ...prev.chapterFour.style,
                        envelopeColor: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Paper Color</span>
              <input
                className="h-10 w-full rounded border border-white/20 bg-black/30 px-2 py-1"
                type="color"
                value={config.chapterFour.style.paperColor}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      style: {
                        ...prev.chapterFour.style,
                        paperColor: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Paper Border Color</span>
              <input
                className="h-10 w-full rounded border border-white/20 bg-black/30 px-2 py-1"
                type="color"
                value={config.chapterFour.style.paperBorderColor}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFour: {
                      ...prev.chapterFour,
                      style: {
                        ...prev.chapterFour.style,
                        paperBorderColor: e.target.value
                      }
                    }
                  }))
                }
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-2xl">Final Chapter - Birthday Celebration</h2>
          <p className="mt-2 text-sm text-white/65">Interactive cake scene with candles, blow action, confetti, and hidden birthday message.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter Theme</span>
              <select
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFive.theme}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      theme: e.target.value as MoodTheme
                    }
                  }))
                }
              >
                {MOOD_THEMES.map((theme) => (
                  <option key={`chapter-five-theme-${theme}`} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter Label</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFive.chapterLabel}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      chapterLabel: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter Title</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFive.chapterTitle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      chapterTitle: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Chapter Subtitle</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFive.chapterNote}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      chapterNote: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Wish Text</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFive.wishText}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      wishText: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Number of Candles</span>
              <input
                type="number"
                min={1}
                max={12}
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFive.candleCount}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      candleCount: Number(e.target.value)
                    }
                  }))
                }
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Hidden Birthday Message Inside Cake</span>
              <textarea
                className="h-24 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                value={config.chapterFive.hiddenBirthdayMessage}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      hiddenBirthdayMessage: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-white/85">
              <input
                type="checkbox"
                checked={config.chapterFive.micEnabled}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      micEnabled: e.target.checked
                    }
                  }))
                }
              />
              Enable microphone blowing feature
            </label>
          </div>

          <h3 className="mt-6 text-lg">Cake Design</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Cake Image Source</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                value={config.chapterFive.cakeImageSrc}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      cakeImageSrc: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-white/70">Upload Cake Design Image</span>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                onChange={(e) => setChapterFiveCakeImageFile(e.target.files?.[0] || null)}
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="button"
                className="rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                onClick={uploadChapterFiveCakeImage}
                disabled={uploadingChapterFiveCakeImage}
              >
                {uploadingChapterFiveCakeImage ? 'Uploading...' : 'Upload Cake Image'}
              </button>
            </div>
          </div>

          <h3 className="mt-6 text-lg">Audio</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Background Music Source</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                value={config.chapterFive.backgroundMusicSrc}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      backgroundMusicSrc: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-white/70">Upload Background Music</span>
              <input
                type="file"
                accept="audio/*"
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                onChange={(e) => setChapterFiveMusicFile(e.target.files?.[0] || null)}
              />
            </label>
            <div>
              <button
                type="button"
                className="rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                onClick={uploadChapterFiveMusic}
                disabled={uploadingChapterFiveMusic}
              >
                {uploadingChapterFiveMusic ? 'Uploading...' : 'Upload Background Music'}
              </button>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/60">Celebration Sound Source</span>
              <input
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                value={config.chapterFive.celebrationSoundSrc}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    chapterFive: {
                      ...prev.chapterFive,
                      celebrationSoundSrc: e.target.value
                    }
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-white/70">Upload Celebration Sound</span>
              <input
                type="file"
                accept="audio/*"
                className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                onChange={(e) => setChapterFiveSfxFile(e.target.files?.[0] || null)}
              />
            </label>
            <div>
              <button
                type="button"
                className="rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                onClick={uploadChapterFiveSfx}
                disabled={uploadingChapterFiveSfx}
              >
                {uploadingChapterFiveSfx ? 'Uploading...' : 'Upload Celebration Sound'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl">Story Blocks ({memoryCount} memories)</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-black"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    storyBlocks: [...prev.storyBlocks, makeMemory(prev.storyBlocks.length + 1)]
                  }))
                }
              >
                Add Memory
              </button>
              <button
                type="button"
                className="rounded-lg bg-violet-500 px-3 py-2 text-sm font-semibold text-black"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    storyBlocks: [...prev.storyBlocks, makeLetter(prev.storyBlocks.length + 1)]
                  }))
                }
              >
                Add Letter
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {config.storyBlocks.map((block, index) => (
              <article key={`${block.id}-${index}`} className="rounded-xl border border-white/15 bg-black/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                    {index + 1}. {block.kind}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-white/70">
                      Position
                      <select
                        className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs"
                        value={index + 1}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            storyBlocks: moveBlockTo(prev.storyBlocks, index, Number(e.target.value) - 1)
                          }))
                        }
                      >
                        {config.storyBlocks.map((_, optionIndex) => (
                          <option key={`${block.id}-position-${optionIndex + 1}`} value={optionIndex + 1}>
                            {optionIndex + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="rounded border border-white/20 px-2 py-1 text-xs"
                      onClick={() => setConfig((prev) => ({ ...prev, storyBlocks: moveBlock(prev.storyBlocks, index, -1) }))}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="rounded border border-white/20 px-2 py-1 text-xs"
                      onClick={() => setConfig((prev) => ({ ...prev, storyBlocks: moveBlock(prev.storyBlocks, index, 1) }))}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="rounded border border-rose-400/50 px-2 py-1 text-xs text-rose-300"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          storyBlocks: prev.storyBlocks.filter((_, currentIndex) => currentIndex !== index)
                        }))
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isMemoryBlock(block) ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs text-white/70">ID</span>
                      <input
                        className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                        value={block.id}
                        onChange={(e) => updateBlock(index, { ...block, id: e.target.value })}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-white/70">Chapter</span>
                      <select
                        className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                        value={block.chapter}
                        onChange={(e) => {
                          const chapter = e.target.value as StoryMemory['chapter'];
                          updateBlock(index, {
                            ...block,
                            chapter,
                            chapterLabel: config.chapterMeta[chapter]?.label || chapterMeta[chapter].label,
                            chapterNote: config.chapterMeta[chapter]?.note || chapterMeta[chapter].note
                          });
                        }}
                      >
                        {chapterOrder.map((chapter) => (
                          <option key={chapter} value={chapter}>
                            {config.chapterMeta[chapter]?.label || chapterMeta[chapter].label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-white/70">Theme</span>
                      <select
                        className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                        value={block.theme}
                        onChange={(e) => updateBlock(index, { ...block, theme: e.target.value as MoodTheme })}
                      >
                        {MOOD_THEMES.map((theme) => (
                          <option key={theme} value={theme}>
                            {theme}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-white/70">Media Type</span>
                      <select
                        className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                        value={block.mediaType}
                        onChange={(e) => updateBlock(index, { ...block, mediaType: e.target.value as 'image' | 'video' })}
                      >
                        <option value="image">image</option>
                        <option value="video">video</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-white/70">Handwritten Title</span>
                      <input
                        className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                        value={block.handwrittenTitle}
                        onChange={(e) => updateBlock(index, { ...block, handwrittenTitle: e.target.value })}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-white/70">Main Title</span>
                      <input
                        className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                        value={block.title}
                        onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs text-white/70">Paragraph Lines (one per line)</span>
                      <textarea
                        className="h-24 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                        value={linesToText(block.paragraph)}
                        onChange={(e) => updateBlock(index, { ...block, paragraph: textToLines(e.target.value) })}
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs text-white/70">Media Source</span>
                      <input
                        className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                        value={block.mediaSrc}
                        onChange={(e) => updateBlock(index, { ...block, mediaSrc: e.target.value })}
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs text-white/70">Audio Source</span>
                      <input
                        className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                        value={block.audioSrc}
                        onChange={(e) => updateBlock(index, { ...block, audioSrc: e.target.value })}
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs text-white/70">Music Player Icon Source</span>
                      <input
                        className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 font-mono text-xs"
                        value={block.songIconSrc || ''}
                        onChange={(e) => updateBlock(index, { ...block, songIconSrc: e.target.value })}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs text-white/70">ID</span>
                      <input
                        className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                        value={block.id}
                        onChange={(e) => updateBlock(index, { ...block, id: e.target.value })}
                      />
                    </label>
                    <div className="block">
                      <span className="mb-1 block text-xs text-white/70">Theme</span>
                      <p className="rounded border border-white/20 bg-black/30 px-3 py-2 text-sm text-white/80">intimate</p>
                    </div>
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs text-white/70">Letter Lines (one per line)</span>
                      <textarea
                        className="h-24 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
                        value={linesToText(block.lines)}
                        onChange={(e) => updateBlock(index, { ...block, lines: textToLines(e.target.value) })}
                      />
                    </label>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-2xl">Raw JSON (Full Control)</h2>
          <p className="mt-2 text-sm text-white/65">
            Edit full layout config directly, then click Apply JSON and Save.
          </p>
          <textarea
            className="mt-4 h-80 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 font-mono text-xs"
            value={jsonDraft}
            onChange={(e) => setJsonDraft(e.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={applyJson} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black">
              Apply JSON
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(jsonDraft).then(() => setMessage('JSON copied to clipboard.'))}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm"
            >
              Copy JSON
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
