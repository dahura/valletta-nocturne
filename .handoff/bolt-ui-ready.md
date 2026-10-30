# Bolt/address UI candidate ready · 2026-10-30 11:54 UTC

Status: independent R4 LOCAL PASS received from parent on2026-10-30; no critical findings. Production publication authorized, commit/push/deploy now proceeding. Fresh R5 public smoke remains pending. Current base HEAD `261db1b` (main). Candidate local UI: http://127.0.0.1:5173/#stop/city-gate . Public URL remains https://valletta-nocturne.vercel.app until approved deployment.

## Product contract and actual changes

- Existing approved React/@dahura/bx app and button/typographic/color tokens retained. This is the small extension authorized in the current brief. Reused Q2's 10 visually inspected place/action references in `.handoff/design-research.md` (especially H&M directions adjacency, Telescope place/map/action, komoot selected place). UXPeak grouping/interaction-cost guidance and its recorded illustration access limitation remain applicable; no new design direction/Paper redesign or approval pause introduced.
- Traveler on foot in Valletta needs the address and a way to reach the next place. Address is visible under stop actions; related controls stay together in reachable content. All new controls measured >=44 CSSpx at390 and320. Home exposes an expandable “На такси к началу” with the first landmark/actions.
- `public/data/guide.json`: all13 exact researched display addresses, source metadata appended to existing sources; stop1 has separate Triton Fountain taxi landmark35.8956128,14.5082709. Its visit pin35.896356,14.50946 remains unchanged. Taxi address is split into visible name `Triton Fountain` + `Vjal Nelson, Floriana, Malta`; copying composes exact `Triton Fountain, Vjal Nelson, Floriana, Malta`. Research JSON all13/address/landmark/note matches verified.
- `src/types.ts`: optional address/taxiDestination contract.
- `src/features/photo-guide/server.ts`: BX output schema permits these optional fields and validates coordinate ranges. Existing three explicit Vercel API handler files preserved.
- `src/features/guide/validateGuide.ts`: validates added optional fields, retains exact13/date2026-10-30 author guard.
- `src/navigation.ts`: official current Bolt rider HTTPS smartlink only (`https://bolt.sng.link/Epy3j/o5l4/8p88`), no query/URI inference; taxi landmark map link encoded with URLSearchParams; custom stops copy coordinates, no invented postal address.
- `src/StopNavigation.tsx`: selectable address/copy with polite live success/error; ordinary Bolt anchor + map action. Separate visit/taxi copies. Explicit “Адрес нужно вставить в Bolt вручную” and “Проверьте доступную точку высадки в Bolt.” No automatic launch, booking, pickup/GPS transmission, timers or SDK.
- `src/App.tsx`: component in stop detail and home taxi disclosure; existing map action moved into address block to avoid duplicate controls. Personal route behavior unchanged.
- `src/styles.css`: compact existing-token address grouping, existing button classes, narrow wrapping; no new visual system.

Research: `.handoff/bolt-link-research.md` and `.handoff/bolt-addresses.json`. Primary landmark source https://scienceinthecity.org.mt/getting-there/ and actual OSM fountain https://www.openstreetmap.org/way/561356942 . The fountain is pedestrian orientation, never a verified legal drop-off. Other sources remain in each stop.

## Actual checks

- Full `npm run build` through owner Lexar wrapper passed: BX bundle + TypeScript + Vite. `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-ui/20261030T115149Z-0cd1e079/console.log`.
- Real local rebuilt BX Node handler POST guide/get HTTP200, all13 addresses and taxi metadata exact to static catalog; static dist guide JSON matches source byte for byte. Strict frontend validator rejects wrongdate,12stops,invalidaddress,invalidtaxilat; builder verifies exact HTTPS/no unsupported query, separate first taxi map pin, custom coordinate query. Evidence `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-ui/20261030T115242Z-1766924e/` (`console.log`, `api-guide-response.json`, `api-runtime.log`, `data-immutable-report.json`, `contract-check.ts`). Temporary API process8791 stopped after test.
- Browser Chromium Chrome through Playwright CLI: all13 real data stops at390/320, exact official Bolt URL/noquery (initial webpage URL, superseded by final CTA check below), each original visit mapID, target heights>=44, no horizontal overflow. Real clipboard success for visit/taxi/custom with browser permission; test-injected clipboard failure yields aria-live manual-copy recovery and selectable text. Actual existing custom-point form submitted with name `Кофе & море / ?`, coordinates copied and actual internal map opened. Home disclosure verified with separate encoded fountain map coordinates. No nested interactive controls. `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-ui/20261030T115215Z-55ce9303/console.log` and `browser-check.js`; fullpage city-gate390/320,home320,custom320 screenshots there.
- Visually inspected390/320 viewport screenshots + desktop1280 nooverflow. `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-ui/20261030T115252Z-2d63b158/address-actions-390.png`, `address-actions-320.png`, `address-desktop.png`.
- Before public screenshot `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-ui/20261030T115115Z-4c786d7e/before-city-gate-390.png`.
- `git diff --check` clean.

## Immutable content / before-after hashes

All13 narration/sections exact string values, all preexisting stop fields except appended sources unchanged. All35 public files other than guide.json matched SHA256 baseline, including every MP3, PDF, photo, map, audio manifest and release archive. Baseline `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-ui/20261030T115002Z-29c720f1/immutable-public-baseline.json`; stories baseline `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-ui/20261030T114949Z-9397ffd9/immutable-baseline.json`. Result/new guideSHA256 `66ca4b38ba68cea325ce3542b3149913e91401ebc5d1ed02924bdac9e1c6f48b` recorded in data-immutable-report.json. No audio/PDF rebuild.

## Limits / verification setup

No official public destination-prefill contract was verified. Bolt uses its current official rider CTA, verified by researcher in first-party JS and app association metadata; no physical installed-app launch or prefilled destination guarantee. No real iOS/Android installed/uninstalled app test or trip booking claimed. Official CTA/web fallback contract established by research. Independent R4 LOCAL PASS received; independent R5 public smoke pending publication.

T3 preview snapshots failed twice with exact “Preview automation snapshot timed out after 15000ms.” Following permitted fallback, Playwright CLI used installed Chrome (default bundled Chromium absent). All config/payload/log/screenshot output explicitly on verified Lexar through lexar.py qa; short /tmp/pw-vn is only a runtime socket, not evidence. CLI session `valletta-bolt` is test-only. Browser tests intentionally abort guide/get to exercise current static fallback because the preexisting local dev API has an older in-memory bundle. Browser console net::ERR_FAILED entries are exactly this fixture; no application runtime errors seen. Separately rebuilt BX API checked real HTTP above. Fresh verifier can use fresh Chrome/context or current static local route, and inspect rebuilt API independently. Optional photo/GPS unchanged; no new prompts.

Deploy preflight already verified `vercel whoami=dahura`, teams checkmark `dahuras-projects`; linked project `prj_qHz5Kjbsaom212jIaZdn6VVXe1zX`, org `team_nUwXa2jkvvzmKXgMH9Nn7Y72`. Only this team and primary Vercel production deployment authorized after parent's independent PASS. No Cloudflare changes. Existing unrelated untracked handoffs preserved.

## Final CTA integration · 11:54 UTC

The researcher's late official CTA discovery supersedes initial generic rider webpage link: production `BOLT_RIDER_URL=https://bolt.sng.link/Epy3j/o5l4/8p88`, no parameters. First-party source https://assets.homepage.bolt.eu/1.24.18/_next/static/chunks/96344-49ff8a8a2aad999c.js . Copy explicitly requires manual address insertion. Research confirms rider association metadata, not actual physical phone handoff. No native-app guarantee. Final build and390/320 exact-link checks follow; parent fresh review must assess this final URL.

FINAL candidate validation complete: full React/BX/types/Vite build passed with final smartlink (`/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-ui/20261030T115447Z-9ae4e617/console.log`). Exact currentCTA/manual-insertion/nooverflow checked on every one of13 stops at390 and320; taxi copy still exact; desktop actual click opened a new tab and loaded `https://bolt.sng.link/ch/Epy3j/o5l4/8p88`, original guide remained in place. This is an observed smartlink page, not a phone-app launch claim. Final strict13/date/address/taxicoords/custom-query contract check passed. Evidence and final screenshots: `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-ui/20261030T115459Z-7692834f/` (`console.log`, `final-cta-check.js`, `final-contract-check.ts`, `final-cta-390.png`, `final-cta-320.png`). All data/media checks above remain applicable: latechange touched only constant/helper comment and truthful UI sentence.

## Publication gate

Parent explicitly reported independent R4 LOCAL PASS with no critical findings (`.handoff/bolt-verification-r4.md`) and authorized commit/push/main production deployment in dahuras-projects. Frozen8source snapshotSHA256 `97df6dfa55afbb6155a4c4004c6dca450c6f538191a04b962b575919900df34e` rechecked unchanged before commit. No physical-app/prefill claim. Publication result will be recorded below; no docs-only deployment is required.
