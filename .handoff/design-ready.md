# Design ready · Valletta · Город за камнем

2026-10-30, design worker. Paper first: A0 and S1/S2/S3 created and reviewed before any frontend source. Implementation starts after this handoff.

## Paper

- **File:** Valletta · Город за камнем
- **Canon:** paper://file/01M666SHA6DAWGFK7HVDPG83BV/p-1-0
- **Archive:** paper://file/01M666SHA6DAWGFK7HVDPG83BV/p-2-0
- A0 tokens/principles, S1 desktop 1440, S1 phone 390, S2 phone stop/player 390, S3 phone map 390.
- Owner explicitly approved A0/S1/S2/S3/S4 on 30.10.2026: «дизайн утверждаю реализовываем используем bx». All six boards are now GREEN; A0 changelog records approval and React + BX implementation.
- Opened Canon in Paper via deep link.

## Screenshot review

All exports moved from Paper's Downloads into the helper-selected verified Lexar run:
`/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/design/20261030T104830Z-07013042/`

- `paper-a0.png`
- `paper-s1-desktop.png`
- `paper-s1-mobile.png`
- `paper-s2-mobile-player.png`
- `paper-s3-mobile-map.png`

Review: title hierarchy and Cyrillic clear; columns align; actions distinct; phone play target 52px and other actions >=44px; no artboard clipping after desktop set fit-content. Stop body is a scrolling document behind reserved dock space in implementation, not clipped content. Map active tab corrected to Карта. Paper's map is layout/reference only: actual 13 markers and street path come from content worker. S2 provisional body is replaced entirely by guide.json. Screenshots do not establish real playback or physical-device touch behavior.

## Direction / tokens

Mood: полуденная тень (sunlit limestone, old paper and deep ink), consistent with a daytime walk and a mysterious editorial tone.

| Role | Value |
|---|---|
| paper | #F5F0E6 |
| limestone | #D8BF91 |
| ink | #242725 |
| burgundy | #702D3A |
| stone | #746D62 |
| line | #C9BDAA |
| display | Cormorant Garamond 500, Cyrillic, desktop 98/86, phone 57/52 |
| body/UI | Manrope 400–700; body 17–18 / 28–29 |
| rhythm | 8, 16, 24, 40, 64, 96 |
| corners | 4–8px, functional controls; round only play/markers |
| measure | up to 68ch for prose; max page 1312px |

Do not add decorative dashboard tiles. Home uses a masthead, two-column editorial title, full panorama and two actions. Route uses numbered rows and a story reader. Thumb zone: persistent 3-item bottom nav, player above it; safe-area inset. Zoom enabled; reduced motion; no autoplay; visible focus.

## Contract / claim checks

User and situation: one of two Russian-speaking travellers at City Gate on 30 October. Job: choose next stop, hear a short story, find the way and look back at the city.

- 13 points and planned 3–4 hours derive from the brief; final distance/duration read from guide.json.
- Tickets/hours/cafés/bus details appear only from practical records with sources and checked/uncertain states. No invented prices or live availability.
- Legend is visually distinct, explicitly labelled; no legends are fabricated for missing records.
- Audio is an actual HTML audio element; manifest only enables existing tracks. Missing/failed audio keeps the full readable text and offers retry. No fake playable state or autoplay.
- PDF/MP3 links shown only for available artifacts; actual final PDF path: /downloads/valletta-audioguide-ru.pdf.
- Photos use the data worker's credited Wikimedia assets. Paper reference panorama: Richlv, CC BY-SA 4.0, cropped, https://commons.wikimedia.org/wiki/File:Saluting_battery_and_Grand_Harbour_in_Valletta.jpg . Frontend selects the actual credited Upper Barrakka photo from guide.json.

## Research

See `.handoff/design-research.md`: three questions, >=10 relevant visually inspected unique examples each. Native images inspected inline through Mobbin. Rejects excluded. UXPeak articles text read; Medium illustrations unavailable (HTTP403 from direct request, T3 snapshot twice timed out). Their fixed dimensions are not treated as universal law.

## Ownership / implementation

Only src/**, index.html, public/favicon.svg and public/site.webmanifest. Stack agreed by platform handoff: React 19.3.1, TS7, Vite8, lucide-react, Leaflet1.9.4. No package/lockfile/data/map/audio/PDF edits. No commits, push or deploy.

Build and browser QA pending implementation and real guide.json. Browser native preview attempted first; two snapshot timeouts on Medium. Retest on local site before fallback if useful.

## Owner addition: personal route / GPS

S4 Мой маршрут / Вы здесь mobile390 added to Canon, yellow. Screenshot paper-s4-personal-gps.png. Numeric GPS values on this design board are labelled example layout data, never actual live state; implementation displays only real browser position. Accessible up/down, skip/return, visited, add custom point, versioned localStorage, reset+undo. Original PDF is labelled Авторский маршрут; modified map uses honest schematic straight segments and external foot directions until real personalized routing exists. GPS is explicit/foreground, latest in memory, nearest straight-line distance, no autoplay or route jumps. Core browser scenarios pending.

Approval 30.10.2026: all previously presented boards green. No new design round. BX typed API integration to follow platform contract; Vite + React retained.


## Candidate final handoff · 11:07 UTC

**Local URL:** http://127.0.0.1:5173/ (Vite dev, process session94934). No commit, push or deploy performed. Source remains shared scratch.

**Implemented:** responsive home / personal route / all stop stories / Leaflet map / practice / author PDF availability / actual HTML audio; self-hosted Cyrillic fonts. Personal route has accessible up/down, skip/return, visited, reset+undo, coordinate/custom map-point addition, localStorage version1, safe parsing, no login. Location watch starts only by explicit action, clears on off/map unmount/hidden page; position held in memory; accuracy circle, nearest selected straight-line distance and external next walking link. Customized map is dashed schematic, explicitly not street routing; author GeoJSON only for unmodified author order. No GPS-driven audio, stop changes or map panning.

**PASS, actual evidence:**
- 11:04 initial npm run build: TypeScript + Vite passed. Log `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/ui-build/20261030T110407Z-73d33cd6/console.log`.
- 11:07 npm run typecheck passed, including platform's BX files then present. Log `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/ui-typecheck/20261030T110700Z-2218a6b4/console.log`.
- Chromium via Playwright CLI at390: home, route, stop screenshots; reorder first stop down + skip second + reload retained order[2,1,…] and skipped[2]. Explicit assertion on localStorage envelope passed.
- Real MP3 01: Listen -> nonpaused HTMLAudioElement, currentTime>0, no audio.error; Pause action succeeded. Manifest now contains all13 real tracks.
- GPS granted using browser permission grant + Playwright geolocation fixture at CityGate accuracy15m: nearest selected/accuracy UI visible, screenshot captured. No product mock.
- GPS denied state using test-only navigator.geolocation failure callback code1: explicit denied message visible, screenshot captured. A preceding attempt to flip CDP permission in an already granted context timed out; this is not claimed as an OS permission validation.
- localStorage assertion contains no accuracy/location history.
- Desktop1440 screenshot and horizontal scrollWidth <= viewport assertion passed.
- HTTP MP3 returned200 audio/mpeg. Missing PDF currently falls back200 text/html in Vite; product correctly detects MIME and disables PDF link.

**Not checked in this round:** reset/undo interaction, visited persistence, all-skipped, malformed storage, custom coordinate/map-point submit, GPS timeout/unavailable/low accuracy/outside/hidden-page cleanup, actual physical device, keyboard/200% zoom, all13 playback/downloads, PDF final download. Implemented code is not claimed as verified for these paths. Independent verifier should cover them.

**CURRENT BLOCKER introduced concurrently by platform:** latest full npm run build11:06 fails in new `scripts/build-bx.mjs`, esbuild cannot resolve `bun` from @dahura/bx/dist/check/runtime-checks.js. UI did not edit package/build scripts; platform notified. Log `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/ui-final-build/20261030T110632Z-26c7dced/console.log`. Initial11:04 build success is historical; CURRENT full build is NOT green until platform fixes this.

**BX/photo:** host contains lazy optional PhotoGuide import, gated with `VITE_PHOTO_GUIDE_ENABLED=true`. Default false gives an honest unavailable message. `src/features/photo-guide/bx-client.tsx` now exists and exports BXAppProvider. Main.tsx does NOT yet mount it; platform or next assigned implementation worker must wrap App in BXAppProvider and enable flag only after server works. Static guide reads still fetch local guide.json; core route/GPS remain local by design. Photo routes/procedures belong to platform. Do not claim BX integration complete at this handoff.

**Browser access:** native T3 preview opened successfully but snapshot timed out twice on Medium and twice on local site. Raw error: “Preview automation snapshot timed out after 15000ms.” Fallback CLI starts with `PWTEST_SOCKETS_DIR=/tmp/pw-vn` (runtime socket path must be short; not an evidence directory). QA/evidence routed on Lexar. CLI session valletta-ui has test-only geolocation overrides; use a fresh context for independent verification.

**Screenshots:** same design run root above:
- browser-home-390.png
- browser-route-390.png
- browser-stop-390.png
- browser-gps-granted-390.png
- browser-gps-denied-390.png
- browser-home-1440.png

Playwright command/assertion logs:
`/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/ui-browser/20261030T110551Z-63e0ff9b/console.log`
`/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/ui-browser/20261030T110616Z-d9ac7cd7/console.log` (grant passed; later CDP denied flip timeout)
`/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/ui-browser/20261030T110656Z-c1c6fa42/console.log` (persistence/no-location/denied-state/audio/desktop assertions passed)

Ownership returned for next stage: src/** except photo worker's carved-out src/features/photo-guide/**. No further edits after handoff unless root assigns another task.
