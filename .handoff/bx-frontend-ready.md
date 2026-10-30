# BX frontend ready — source frozen 2026-10-30 11:15 UTC

## Frontend

Real installed `@dahura/bx@1.1.1`: main.tsx mounts one BXAppProvider, src/lib/bx.ts re-exports the shared typed client/provider, useGuide calls `bx.guide.get.useQuery({})`. Backend AppRouter is imported type-only by the shared client. No package/API/photo implementation edits by integration worker.

`src/features/guide/useGuide.ts`: retry:false, networkMode:always, validated response. Immediately load /data/guide.json on query error; begin static load after 4 seconds pending. Static request has its own 8-second abort. Full validation requires all 13 unique IDs/slugs and every contracted field, source/image metadata, sections/narration; it runs on both network sources. A successful API later replaces fallback data. Route/GPS/audio logic unchanged. App exposes nonvisual data-guide-source=bx|static for verification.

Important real-library detail fixed: Eden revives ISO calendar dates into Date objects. The guide selector restores date to YYYY-MM-DD before validating, preserving public Guide string contract. Before this fix the normal HTTP200 response unnecessarily fell back; final browser assertion proves source=bx, count=13. Final proof: bx-final-query/20261030T111539Z-be3324d5/console.log.

PhotoGuide now uses a direct typed lazy import. Enable only via explicit VITE_PHOTO_GUIDE_ENABLED=true; default remains false per assignment. Both disabled and enabled frontend builds pass. Enabling/live photo verification belongs to platform. No claim of photo API success here.

## Factual correction, owner explicitly extended scope

Only guide.routeNotes[2..3] and practical Cathedral record changed; all stops/narration/sections frozen. Official https://www.stjohnscocathedral.com/visit/ rechecked: Museum closed for extension/refurbishment; this does not establish Cathedral/oratory/Caravaggio closure, actual access must be checked. Official recommended duration 1h45; author's 55–70min is shortened and full duration adds35–50min to3–4h loop.

scripts/build-pocket-pdf.py factual strings updated and existing generator rerun. PDF24pages,90x160mm,11.5pt body,5,231,824bytes. Changed pages1/4/18/21 rendered at1400px and visually inspected: no clipping/overlap. Generator checks all pages bounds/dimensions and all13 single-stop pages.

FINAL PDF SHA256: 027703dd19e5d1288f3323f7753e6b742f6c6c48ca95ed07a6729bd05f79a8bc
Protected all13 stop sections+narration combined canonical JSON SHA256 BEFORE=AFTER: 60f0bd593fff2a9f0766f5c6ef39cb9c243e3c259568016458e4186f73fafa0e

## QA

All roots below `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/`.

- Final typecheck PASS: bx-freeze-types/20261030T111540Z-57b80ff9/console.log.
- Final Vite PASS: bx-freeze-vite/20261030T111545Z-1a55972f/console.log; final client output in that run/dist.
- Both photo flag variants PASS (before last calendar-date normalization): bx-release-frontend/20261030T111510Z-f8750e9e/console.log.
- Real Chromium390: forced403 ->13points456ms and exactly1BX request; pending6500ms ->13points4605ms and exactly1BX request; normal endpointHTTP20013. bx-browser-network/20261030T111400Z-7ecdb61c/console.log. Final actual data source=bx13 after Eden normalization: bx-final-query/20261030T111539Z-be3324d5/console.log.
- Final PDF layout evidence: pdf-cathedral-correction-fit/20261030T111359Z-08bfb76a/pdf-layout-evidence.json.
- Final changed-page PNGs: pdf-cathedral-render/20261030T111422Z-ab0b962b/page-{01,04,18,21}.png.
- Stop protection hashes saved in bx-browser-network/20261030T111400Z-7ecdb61c/content-correction-protected-sha.json.
- Native T3 preview attempted first: snapshot twice failed raw “Preview automation snapshot timed out after15000ms”; Playwright CLI fallback used. Its initial two own temporary console/snapshot files moved to Lexar; no other worker files touched.

## Handoff

No commits/deploy/restarts by this worker. Shared Vite5173 continues. Source/data/PDF frozen; platform must rebuild real API bundle after guide correction and perform one independent full npm run build. Full backend build and live photo mutations were not repeated by frontend worker. No new dependencies needed. Frontend paths returned to parent; no further edits planned.
