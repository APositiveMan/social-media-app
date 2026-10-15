# The Phone That Wouldn't Let Go

A calm, finite app for people who want to quit social media. Version 1 tells one
recovery story: a welcome screen, seven short chapters, and a closing takeaway.

Built with Expo (SDK 57), React Native, TypeScript, and Expo Router. It runs in
**Expo Go**, so you don't need Xcode or a Mac.

## Requirements

- [Node.js](https://nodejs.org) 20 or newer (`node -v` to check)
- The **Expo Go** app on your iPhone, from the App Store
- Your computer and iPhone on the same Wi-Fi network

## Run it

```sh
npm install
npm start
```

`npm start` runs `npx expo start` and shows a QR code in the terminal.

### Open it on your iPhone

1. Open the iPhone **Camera** app and point it at the QR code.
2. Tap the **Open in Expo Go** banner that appears.
3. The app loads. Save a file on your computer and the phone reloads with the change.

If the phone can't connect (common on office, school, or public Wi-Fi, or with
a VPN), use a tunnel instead:

```sh
npx expo start --tunnel
```

### Other targets

```sh
npm run web       # open in a browser
npm run android   # Android device or emulator with Expo Go
```

## Edit the story

All of the story text lives in **`content/story.ts`**: the title, the welcome
line, the seven chapters, and the closing takeaway. You don't need to touch
any UI code to change it.

- Each chapter has a `title` and a `body`.
- In a `body`, leave a blank line between paragraphs.
- The tests expect exactly 7 chapters. If you change the count, also update
  `EXPECTED_CHAPTER_COUNT` in `__tests__/story.test.tsx`.

## Checks

```sh
npm test            # Jest tests (content + all screens render)
npm run typecheck   # TypeScript
npx expo lint       # ESLint
```

## Project layout

```
content/
  story.ts            All story text (edit this)
src/
  app/                Expo Router routes: every file here is a screen
    _layout.tsx       Root stack navigator and system light/dark background
    index.tsx         Welcome screen
    story.tsx         Seven swipeable chapters with a progress bar
    closing.tsx       Closing takeaway
  components/         Reusable UI (Screen, Button, ProgressBar, ChapterView)
  theme/              Colors for light and dark mode, spacing, type sizes
__tests__/            Jest tests
```

To add a new feature, such as an urge button or daily check-ins, add a route
file in `src/app/` (for example `src/app/urge.tsx`) and build it from the
components in `src/components/`.

## Design principles

The app's design is part of what it does, so keep these when adding features:

- **Finite.** Every screen has an end. No feeds and no infinite scroll.
- **No hooks for attention.** No streaks, badges, points, or notifications that pull you back in.
- **Readable.** Large type, generous spacing, and light or dark mode that follows the system setting.
