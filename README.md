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

## Accounts

The welcome screen has optional **Log in** and **Create an account** links. The
story stays readable without an account. Signing up also signs you in. When you
are signed in, the welcome screen shows "Signed in as …" and a **Log out** button.

| Screen / route | What it does |
| --- | --- |
| `src/app/signup.tsx` | Username, email, password |
| `src/app/login.tsx` | Email **or** username, plus password |
| `POST /api/signup` | Creates the account. Returns `201 { token, account }`, `400`/`409 { errors }` |
| `POST /api/login` | Returns `{ token, account }`, or `401` with one message for any wrong detail |
| `GET /api/me` | `Authorization: Bearer <token>`. Returns `{ account }` or `401` |
| `POST /api/logout` | Ends that one session. Always `204` |

The API routes are [Expo Router API routes](https://docs.expo.dev/router/web/api-routes/)
in `src/app/api/`. They run on the dev server when you run `npm start`.

- Passwords are stored only as salted PBKDF2 hashes (`src/server/passwords.ts`).
- Sessions last 30 days. The server stores only a hash of each token
  (`src/server/sessions.ts`).
- The app keeps its token in the iOS Keychain or Android Keystore via
  `expo-secure-store`, and in `localStorage` on web (`src/lib/tokenStorage*.ts`).
  `src/lib/auth.tsx` restores the session when the app opens.
- Validation rules live in `src/lib/signup.ts` and `src/lib/login.ts`, shared by
  the screens and the server.

During development, users and sessions are saved to `.data/users.json` and
`.data/sessions.json` (git-ignored). Delete `.data/` to start fresh.

Try the API directly while `npm start` is running:

```sh
curl -X POST http://localhost:8081/api/signup -H "Content-Type: application/json"   -d '{"username":"quiet_reader","email":"me@example.com","password":"long enough"}'
```

## Before release

> **Do not release the app until a real database replaces the development file store.**

The `.data/` JSON files only work on your computer. EAS Hosting has no disk, so
a live app would lose every account. To stop that from happening by accident,
`devFileCollection` in `src/server/collection.ts` **throws in production
builds**, and every signup or login fails with "No production database is
configured". Don't remove that check.

To get ready for release:

1. Set up a hosted database, for example Postgres on Neon.
2. Implement the `UserStore` and `SessionStore` interfaces (`src/server/users.ts`,
   `src/server/sessions.ts`) on top of it. The screens and API routes don't need to change.
3. Add rate limiting to `/api/login` and `/api/signup` to slow password guessing.
4. Remove the "Release blocker" section from `AGENTS.md` and this section.

## Checks

```sh
npm test            # Jest tests (content, screens, accounts API)
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
    signup.tsx        Create an account
    login.tsx         Log in
    api/              Server-only API routes: signup, login, logout, me
  components/         Reusable UI (Screen, FormScreen, Button, TextField, ProgressBar, ChapterView)
  lib/                App-side code: auth state, API calls, validation shared with the server
  server/             Server-only code: password hashing, user and session storage
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
