# Pokloni Mi 🎁 (GiftMe)

A mobile-first PWA gift registry. Hosts create a celebration (wedding, birthday, baptism, …), add gift suggestions in three categories (*nice to have*, *ok to have*, *do not want*), and share a public link. Guests reserve gifts **without an account**; the host tracks reservations in a private dashboard.

- **Frontend** (this repo): Next.js 14 App Router, TypeScript, Tailwind CSS, Tolgee i18n.
- **Backend**: separate Express + MongoDB API (`giftmeBE` repo) — see its README for setup.

Requires **Node.js 18.18+** (developed on Node 22).

## Getting Started

### 1. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.development.local.example .env.development.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API, e.g. `http://localhost:3002/api`. |
| `NEXT_PUBLIC_USE_MOCKS` | Set to `true` to run the UI against in-memory mock data (no backend). Defaults to off. |
| `NEXT_PUBLIC_TOLGEE_*` | Optional; see [Tolgee setup](#tolgee-setup). |

### 2. Install dependencies

```bash
npm install
```

### 3. Run the backend, then the development server

```bash
# in ../../giftmeBE (or wherever the API lives):  npm start
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |
| `npm test` | Vitest unit tests |

## Reservation & quantity behavior

- Every **item gift** has a desired quantity; the backend atomically consumes one unit per guest reservation. At zero remaining, the gift shows as *reserved* and cannot be selected. The backend is the source of truth — the UI never decides availability.
- The **money envelope** gift (`type: "envelope"`) is unlimited: any number of guests can select it, and it never shows an out-of-stock state.
- **Do-not-want** items are informational only — visible to guests, never reservable.
- Reservations send a client-generated `requestToken`; retries/double-taps of the same submission are idempotent on the server.
- Guests enter only a display name; it is shown **only to the host**, never to other guests.

## PWA

- `public/manifest.webmanifest` + icons in `public/icons/` make the app installable (standalone display, maskable icon).
- `public/sw.js` caches the app shell and static assets, serves `public/offline.html` when navigation fails offline, and **never caches API responses** (availability must be live; private host data must not be cached). Registered by `src/components/shared/PwaRegister.tsx` in production builds only.
- Reserving a gift requires a network connection; the UI says so when offline.
- To ship a breaking SW change, bump `CACHE_VERSION` in `public/sw.js`.

---

## Tolgee Setup

The app ships with bundled translation files (`messages/sr.json`, `messages/en.json`, `messages/de.json`) so it works **without any Tolgee account**. The environment variables below are only needed when you want live in-context editing or CDN-delivered translations.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_TOLGEE_API_KEY` | Dev only | Enables the Tolgee in-context editor overlay in development. |
| `NEXT_PUBLIC_TOLGEE_API_URL` | Dev only | Tolgee instance URL. Use `https://app.tolgee.io` for the cloud. |
| `NEXT_PUBLIC_TOLGEE_CDN_URL` | Production | CDN prefix for serving translations without an API key. |

### How to get the keys

1. **Create a project** at [app.tolgee.io](https://app.tolgee.io) (or your self-hosted instance).
2. Go to **Project → Settings → API keys** and click **+ Add API key**.
   - Grant at least the `translations.view` and `translations.edit` scopes for local development.
   - Copy the generated key into `NEXT_PUBLIC_TOLGEE_API_KEY`.
3. Set `NEXT_PUBLIC_TOLGEE_API_URL` to `https://app.tolgee.io` (or your own instance URL).
4. *(Optional — production)* Go to **Project → Settings → Content delivery** and copy the CDN URL into `NEXT_PUBLIC_TOLGEE_CDN_URL`.

### Adding or editing translation keys

All translation keys live in `messages/<lang>.json`. There are three ways to edit them:

**Option A — Edit the JSON files directly**

Open `messages/sr.json`, `messages/en.json`, or `messages/de.json` and add/change keys. The structure is a nested JSON object, e.g.:

```json
{
  "nav": {
    "home": "Početna"
  }
}
```

The key path used in code is `nav.home` (dot-separated).

**Option B — Tolgee in-context editor (recommended for translators)**

1. Set `NEXT_PUBLIC_TOLGEE_API_KEY` and `NEXT_PUBLIC_TOLGEE_API_URL` in your `.env.development.local`.
2. Run `npm run dev`.
3. Hold **Alt** (or **Option** on Mac) and click any text on the page — an editor popover appears directly on the UI.
4. Save changes in Tolgee, then export the updated JSON files back into `messages/`.

**Option C — Tolgee dashboard**

Log in at [app.tolgee.io](https://app.tolgee.io), open your project, and use the **Translations** tab to add keys and translations for all languages. Export as JSON and replace the files in `messages/`.

### Supported languages

| Code | Language |
|---|---|
| `sr` | Serbian (default) |
| `en` | English |
| `de` | German |

To add a new language, add its code to `ALL_LANGUAGES` in `src/tolgee/shared.ts` and create the corresponding `messages/<lang>.json` file.

---

## Project structure

```
src/
  app/
    (marketing)/      # Public marketing pages
    (host)/
      login/          # Auth pages
      register/
      (protected)/    # Requires login (AuthGuard)
        dashboard/
        create/
  components/
    marketing/        # Landing page components
    shared/           # Reusable UI components
  lib/
    api/              # API calls (auth, etc.)
    auth/             # Session helpers & hooks
    utils/
  tolgee/             # Tolgee initialisation
  types/              # Shared TypeScript types
messages/             # Translation JSON files (sr, en, de)
```

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com)
- [Tolgee](https://tolgee.io) — i18n & in-context translation
- [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) — form validation
- [Vitest](https://vitest.dev) — unit tests
- Auth: JWT issued by the Express backend (email+password, Google/Facebook OAuth redirect flow)
