# Year With You

Cinematic, scroll-driven digital love letter built with Next.js App Router, Tailwind CSS, Framer Motion, and local media files from `/public`.

## Stack

- Next.js App Router
- Tailwind CSS
- Framer Motion
- Local audio (.mp3)
- No backend / no DB / no login

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Asset paths

Place your real media files in these locations:

- Intro heartbeat: `/public/audio/heartbeat.mp3`
- Memory songs: `/public/audio/*.mp3`
- Photos: `/public/images/*.jpg` or `.png`
- Videos: `/public/video/*.mp4`
- Song icons: `/public/images/song-*.jpg`

Current story references are defined in `data/story.ts`.

## Structure

- `app/page.tsx`: complete experience entry page.
- `components/year-with-you-experience.tsx`: full cinematic flow + pacing.
- `hooks/use-dual-audio.ts`: dual-element audio crossfade engine.
- `hooks/use-intersection-active.ts`: IntersectionObserver active section hook.
- `data/story.ts`: all chapters, memory content, themes, and local asset links.
- `app/globals.css`: grain overlay, scroll snap, global cinematic styles.

## Notes

- Audio starts only after first user interaction (`Start Our Story`).
- Memory-to-memory songs crossfade over ~3.5s.
- Final scene fades music over 8s.
- Long-press (3s) reveals secret message.
