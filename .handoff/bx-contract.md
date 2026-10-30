# BX contract · 2026-10-30 11:02 UTC

Mandatory owner choice: BX + React. Installed real owner package `@dahura/bx@1.1.1` (npm name `bx` is an unrelated WebdriverIO package and was not installed). React SPA remains unchanged.

## Designer integration (platform implementing these files now)

Client module: **`src/features/photo-guide/bx-client.tsx`**. This is the exact agreed import (platform creating it now; designer may switch static guide fetch):

```tsx
import { BXAppProvider, bx } from './features/photo-guide/bx-client'

// Wrap once at the app root in main.tsx (designer owns that file):
<BXAppProvider><App /></BXAppProvider>

// Verified guide query, optional gradual replacement of existing static fetch:
const guide = bx.guide.get.useQuery({})
```

The query result is `{data, isLoading, error, refetch}` from TanStack Query. `data` has the existing Guide shape (title/subtitle/date/duration/distance/intro/routeNotes/stops/practical/sources). Keep personal route and GPS fully local. `BXAppProvider` wraps the app once; no UI rewrite. Base URL is same-origin `/api/bx`, Vite proxies that prefix locally.

`PhotoGuide.tsx` uses real `bx.photo.explain.useMutation()` and `bx.photo.confirm.useMutation()` internally. Default export, no required props; see `.handoff/photo-contract.md`. Host controls GPS and route state. Pass location only as optional context; feature asks a separate opt-in before sharing it.

## Backend

`src/features/photo-guide/server.ts`: BX `createBX` schema-first routers + actual `bxPlugin` mounted on Elysia's Fetch handler at prefix **/api/bx**. A small Node IncomingMessage/ServerResponse adapter makes that same Fetch handler Vercel-compatible; local smoke server uses the same adapter. `api/bx/[...path].ts` imports the generated bundled runtime. Server implementation stays outside Vercel's API file discovery; client imports its router **type only**. No new server infrastructure, DB or Next.js application required.

Packaging incompatibility found and explicitly handled: published BX1.1.1 uses extensionless ESM directory imports, rejected by native Node22 (`ERR_UNSUPPORTED_DIR_IMPORT .../dist/plugin`). Its public barrel also imports Bun-only CLI Glob checks and Bun SQLite. `scripts/build-bx.mjs` bundles the real createBX/bxPlugin/BXError runtime subset, excludes CLI-only exports, and replaces the unused Bun SQLite adapter with an explicit throwing capability guard (this application has no DB). Postinstall/build generate required `.bx/server.mjs`, retaining native sharp externally. No fake queries/mutations; all specified routes run through the real BX HTTP plugin. Bun SQLite and CLI checks are not advertised in this Node profile.

Minimal host imports now present: `import {BXAppProvider,bx} from './lib/bx'` and `import {useGuide} from './features/guide/useGuide'`; `useGuide()` returns the typed BX query result. All component props remain optional. Existing core App/main files untouched by platform.

- `POST /api/bx/guide/get`, `{}` → verified current `guide.json` data.
- `POST /api/bx/photo/explain`, image/optional opted-in location → structured candidate/uncertainty result from real OpenAI vision.
- `POST /api/bx/photo/confirm`, `{stopId}` → verified known guide description + official source links, no second model charge.

Only a type import of backend router enters the client; server modules/keys must never enter Vite bundle. Photo mutations do not change catalog state and explicitly invalidate no guide queries. Same-origin API URL, no separate backend origin or CORS setup.

## Runtime status

**Real Node runtime smoke PASSED11:10UTC**: guide.get HTTP200/13 stops, photo.explain two real OpenAI calls, photo.confirm exact verified history/sources. BX errors also verified on wrong MIME and cross-origin. Build/typecheck passed after bundling Node runtime. src/main.tsx now mounts BXAppProvider; App.tsx uses useGuide, retaining all local route/GPS state. Photo flag enabled only after actual endpoint smoke. Local API command `envhub use impresme -- npm run dev:api`, Vite `/api/bx` proxy to127.0.0.1:8788. Currently running in platform exec session98476.

Frontend worker now exclusively owns main/App/lib/bx/features/guide. Platform will not edit those further. The proxy now explicitly uses changeOrigin:false; Vite shorthand was rewriting Host to8788 and correctly triggering origin403 for5173. Same-origin retest pending this config reload. Full integrated build at11:11PASS. Photo enabled after actual evidence above, not a mock; VITE_PHOTO_GUIDE_ENABLED is explicit true in Vercel Preview/Production and can be set false to disable.

Evidence: `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/photo-real-integration/20261030T110957Z-7e2e11f5/`. Vercel project created/linked to allowed `dahuras-projects`, Node22/Vite/npm ci/dist. GitHub https://github.com/dahura/valletta-nocturne. OPENAI_API_KEY deployed as Secret to Preview and Production; metadata-only listing verified. Preview deploy follows host integration build.

Audio COMPLETE at11:02UTC: all13 real MP3s published under `public/audio`, complete manifest in `public/data/audio-manifest.json`. Existing generated native-Russian mature bass-baritone `Halloween Velvet C selected`, voiceID `FNr9JM4AKsLQH8gw9NB3`, Multilingual v2. No extra preview credits or voice slot changes; duration57.6–66.3sec. Immutable narration hash saved externally before paid generation. ffprobe/loudness/text alignment validation running now.
