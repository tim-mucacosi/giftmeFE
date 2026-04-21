# Pokloni Mi 🎁

A Next.js gift-registry app with multi-language support via [Tolgee](https://tolgee.io).

## Getting Started

### 1. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.development.local.example .env.development.local
```

See the [Tolgee setup](#tolgee-setup) section below for what each variable means.

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

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

- [Next.js 15](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [Tolgee](https://tolgee.io) — i18n & in-context translation
- [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) — form validation
- [Supabase](https://supabase.com) — auth callback (Google OAuth)
