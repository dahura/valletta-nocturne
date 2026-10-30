# Bolt verification R4 · 2026-10-30

**LOCAL PASS. No critical findings. Public deployment smoke PENDING.** Reviewed final frozen smartlink candidate after its replacement; base HEAD `261db1bb4795dc89d834ab380da802c265e410c9`. Read-only review: no product/config/package/auth/Git/deploy changes. Only this report and external QA evidence written. No child agents.

## Independent evidence

- Full final `npm run build` passed (BX Node bundle + TypeScript + Vite). `git diff --check` passed. Scope is optional address/taxi fields, appended sources, navigation helpers/component, two placements and local CSS. No unrelated API behavior or handler changes.
- Compared every preexisting field against `git show HEAD:public/data/guide.json`: all13 sections, narration, coordinates, photos, directions and other fields exact; sources preserve their original prefix. All13 IDs and address strings match `.handoff/bolt-addresses.json`. Taxi name + street split composes its exact researched full address; coordinates/note exact. No added invented building numbers/postcodes. No address mismatch required additional research.
- Recomputed all35 public-file SHA256 values against prefeature baseline: identical, including PDF, all13 MP3, images/maps/manifests/archive. Guide SHA256 `66ca4b38ba68cea325ce3542b3149913e91401ebc5d1ed02924bdac9e1c6f48b`. Dist static guide equals source byte for byte. Full snapshot recorded in `integrity.json` (includes source hashes).
- Fresh rebuilt Node BX process on8794 returned actual POST `/api/bx/guide/get` HTTP200; all13 stop objects exactly match static catalog. Browser also rendered `data-guide-source=bx` from that process via a test-only request route; no static fixture substituted. Initial test proxy forwarded mismatched Origin/Host and correctly received403; corrected test-only headers passed. Product origin security was unchanged.
- Frontend validator independently rejected18 cases covering empty/nonstring address and null/string/NaN/Infinity/out-of-range taxi latitude/longitude. Original exact13/date guard preserved. Server added field schema has numeric latitude/longitude bounds (`src/features/photo-guide/server.ts:15`). No dynamic URL field added: Bolt fixed HTTPS constant, Google map generated from numeric coordinates with URLSearchParams, visit map internal. Existing source URL validation behavior unchanged.

## Targeted browser results

Installed Chrome, own session `vn-r4`, 390×844 and320×844. All13 exact researched address labels and final `https://bolt.sng.link/Epy3j/o5l4/8p88` hrefs passed with no parameters. Existing map href stays `#map/<id>`. Every new link/button in stop block >=44 CSSpx; no horizontal overflow. Visually inspected both City Gate fullpage screenshots with player/bottom navigation present. New block legible, grouped and reachable by scrolling; actual clicks succeeded. No nested interactive controls. Focus-visible outline checked on Bolt anchor.

Real granted clipboard + real clicks returned exact `Triton Fountain, Vjal Nelson, Floriana, Malta` for taxi and distinct City Gate address for visit. Test-only throwing clipboard.writeText yielded truthful “Не удалось скопировать” polite aria-live status and user-select:text recovery. Source `src/StopNavigation.tsx:10` uses same recovery when Clipboard API is unavailable.

Home disclosure operated normally and displays Triton; external map query is `35.8956128,14.5082709`, distinct from original visit `35.896356,14.50946`. Source `src/App.tsx:97`; name/street/note/copy grouping `src/StopNavigation.tsx:20`; map builder `src/navigation.ts:14`. Warning tells traveler to check an accessible drop-off in Bolt; fountain is an orientation landmark, no claim of legal vehicle setdown.

Actual custom-point form accepted `<img src=x onerror=alert(1)> Ħ & море ?` as escaped text, created no img element, exposed coordinates rather than fake postal address, copied exact `35.898000, 14.514000`, retained final Bolt href and opened internal map. Numeric map URL construction cannot interpret its name as HTML/URL.

Source confirms `target=_blank rel="noopener noreferrer"` (`src/StopNavigation.tsx:22`), constant-only Bolt link (`src/navigation.ts:11`), explicit manual-insertion and drop-off warning (`src/StopNavigation.tsx:23`). No new autolaunch, booking/payment or GPS forwarding path.

## Evidence locations

- `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-verification-r4/20261030T115647Z-f37a8a0c/`: final build, integrity.json, schema.ts, api-response.json, console.log. Contains first browser startup failure due long runtime socket path; corrected with short `/tmp/pwr4` socket (runtime only).
- `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-verification-r4/20261030T115755Z-3b2683b5/`: passing browser-check.js/console.log and city-gate-390.png, city-gate-320.png, home-taxi-320.png, custom-320.png.
- `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-verification-r4/20261030T115709Z-4ada58d7/`: intermediate test-only Origin mismatch failure and browser snapshot. No product defect inferred.

T3 preview_status/open used first. Two snapshot attempts returned exact `Preview automation snapshot timed out after 15000ms.` Authorized Playwright fallback used; no shared sessions closed. All commands/evidence routed with owner Lexar wrapper. No extra complete route/GPS/photo/audio/PDF functional suite repeated.

**CRITICAL LIMIT: native Bolt opening on physical iOS/Android, installed/uninstalled app behavior and destination prefill remain UNVERIFIED.** PASS covers web href/display/copy/fallback/schema/content preservation. No Bolt app installed, no ride booked. Source associations are research evidence, not a physical handoff test. Existing phone camera/GPS limitations remain.

Public alias still awaiting new deployment at this local verdict. One bounded production smoke will be appended if readiness arrives during this active R4.
