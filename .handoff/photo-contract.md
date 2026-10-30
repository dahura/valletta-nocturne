# Photo guide contract · 2026-10-30

Platform/audio worker additionally owns `api/**`, `src/features/photo-guide/**`, and photo QA scripts. Design worker owns the host screen and embeds this component. No personal GPS/route ownership changes.

## React integration

```tsx
import PhotoGuide from './features/photo-guide/PhotoGuide'

<PhotoGuide stops={guide.stops} currentLocation={location ? { lat: location.lat, lng: location.lng, accuracy: location.accuracy } : null} onStopSelect={(id) => { /* optional host navigation */ }} />
```

Default export: `src/features/photo-guide/PhotoGuide.tsx`, with its own imported scoped `PhotoGuide.css`. `stops` and `currentLocation` are optional. Component also works without any geolocation and can fetch guide data if no stops are passed. It never requests geolocation itself. Optional props:

- `stops`: readonly guide stops with numeric `id`, `title`; sections/sources may be supplied.
- `currentLocation`: `{lat:number,lng:number,accuracy?:number}` or null.
- `onStopSelect`: `(stopId:number) => void`, only called by an explicit navigation action.

Location is sent only after a separate unchecked-by-default checkbox opts in. Photo selection, compression and preview stay local until the explicit **«Рассказать об этом месте»** action. Change/delete abort a pending request. No localStorage photo history.

## API

Real BX procedures mounted by the actual BX HTTP plugin on Vercel Node22: `POST /api/bx/photo/explain` and `/api/bx/photo/confirm`. Typed client and provider: `src/lib/bx.ts`; catalog hook: `src/features/guide/useGuide.ts`. Existing authorized OpenAI key injected server-side from EnvHub `impresme`, never VITE-prefixed. Current model **gpt-5.4-mini**, verified by two real image calls. No new subscription/service provisioned.

Analyze body:

```ts
{ image:{mimeType:'image/jpeg'|'image/png'|'image/webp',base64:string}, location?:{lat:number,lng:number,accuracy?:number}, shareLocation?:true }
```

Confirm body (explicit manual choice; no second vision charge):

```ts
{ stopId:number }
```

Successful response:

```ts
{ status:'identified'|'uncertain'|'unknown', stopId?:number, title:string, visibleEvidence:string[], answer:string, sources:{label:string,url:string}[], suggestedStops?:{stopId:number,title:string}[] }
```

Known candidates show visual evidence and a confirmation action first. After confirmation, the server returns verified guide description and official links. Unknown images receive visible description/uncertainty and a request for another angle or plaque, without invented historical claims. Only the server's bundled guide supplies known-place history and source URLs. Text in photos is untrusted content, never an instruction.

Errors follow real BX's flat `{code,message,status,requestId,retryable?}` contract. Transport and provider failures have appropriate 400/403/413/415/422/429/502/503/504 status, `Retry-After` for rate limits, no upstream secrets/details. Upstream 401/403 becomes 503 with a clear server-connection message. Request timeout and abort are supported. No request/photo body is logged or stored by this app.

## Limits / QA

Client redraws into canvas (EXIF removed), max 1600px edge, JPEG <=1 MiB. HEIC has a clear JPEG conversion message. Server checks JSON/body size, MIME, file signature, decoded dimensions, origin, per-IP burst and per-instance budget/concurrency; no persistent photo storage. Basic instance limits are not a globally durable billing cap on serverless infrastructure.

Two real image calls will be run through the full local HTTP handler with EnvHub injection: one credited Valletta landmark, one unrelated Wikimedia image. QA images/results/logs stay on helper-selected Lexar artifacts. No fake/mock model output used for the integration claims.

Live integration completed11:10:06UTC: real BX `guide.get`200/13 stops; real City Gate photo → identified ID1, visible evidence and official RPBW citation; explicit confirmation returned exact guide history; unrelated Wikimedia cat → unknown, no invented stop/source. MIME mismatch415 and cross-origin403 passed. Evidence: `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/photo-real-integration/20261030T110957Z-7e2e11f5/`. Component implemented with scoped styles, camera/file preview, change/delete, cancel and manual confirmation. Host BXProvider/useGuide integration completed; photo enabled after real smoke (can disable via VITE_PHOTO_GUIDE_ENABLED=false). Preview deployment next; independent full-site review still belongs to parent's verifier.
