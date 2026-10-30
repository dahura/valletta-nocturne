# Platform readiness · 30 October 2026

Current as of 11:23 UTC. Earlier bootstrap/voice-capacity notes are superseded by this state.

## Published at11:24UTC

- Reviewed release candidate commit pushed to main: f0dd253780fe0a89780711344b9237c3571ac9c2.
- GitHub Release: https://github.com/dahura/valletta-nocturne/releases/tag/v1.0.0 . Both assets uploaded, release public and not draft.
- PDF: https://github.com/dahura/valletta-nocturne/releases/download/v1.0.0/valletta-audioguide-ru.pdf . 5,231,824bytes; SHA256027703dd19e5d1288f3323f7753e6b742f6c6c48ca95ed07a6729bd05f79a8bc.
- Audio ZIP: https://github.com/dahura/valletta-nocturne/releases/download/v1.0.0/valletta-audio-ru.zip . 13,003,371bytes; SHA256c0f769e1647129c1c8891266b383659d789be317d40e287ac77238383acf3845. Exact13finalMP3s plus Russian README/voice attribution; no QA/private files.
- Fresh device auth completed. Account dahura and allowed team dahuras-projects rechecked; a single ordinary retry succeeded. Vercel automatically assigned the first deployment to production, without a separate promotion.
- Actual returned production alias: https://valletta-nocturne.vercel.app . Immutable deployment: https://valletta-nocturne-b56yw4cid-dahuras-projects.vercel.app . CLI Ready54s/exit0. Independent public runtime/browser checks pending at this handoff update.
- Deployment log: /Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/vercel-preview-fresh-auth/20261030T112333Z-4da5611f/console.log . Function builder printed nonfatal TS2688 type-definition warnings after the actual full application build passed; validate deployed runtime rather than infer failure from these warnings.
- Git integration auto-deploy is not connected/proved; deployment used the authorized scoped CLI flow. No Cloudflare deployment performed by this worker.

## Ready

- Public GitHub repository created: https://github.com/dahura/valletta-nocturne . Local branch main, origin configured. Independent full-build/core/media review passed; release candidate commit/push and v1.0.0 PDF/audio release authorized and in progress.
- Vercel project created/linked: dahuras-projects/valletta-nocturne. Account dahura and allowed team confirmed. ProjectID prj_qHz5Kjbsaom212jIaZdn6VVXe1zX, teamID team_nUwXa2jkvvzmKXgMH9Nn7Y72.
- Vite + React + TypeScript scaffold, lockfile and Node22 profile complete. Full integrated build passed 11:11 UTC. Frontend integration worker exclusively owns main/App/lib/bx/features/guide now; platform will not touch them further.
- All **13 real ElevenLabs MP3s** published in public/audio. Manifest public/data/audio-manifest.json has complete:true, IDs/slugs match final immutable narration. Duration57.632–66.316sec, total811.676sec (13min32sec).
- Existing native-Russian mature bass-baritone **Halloween Velvet C selected**, voiceID FNr9JM4AKsLQH8gw9NB3, model eleven_multilingual_v2. Owner explicitly approved existing-voice fallback. New Brother Lorenzo voice is deferred because 10/10 slots are occupied. No voices deleted or bought, no preview tokens spent, no voice newly created for this guide. Manifest states existing-generated / createdForThisGuide:false.
- Narration source hash saved BEFORE paid calls: c6acde02c8d93bf5fe344dbbc6d01e07373e27f73db9bb541d570df366d17b9e, 10,040 characters. Audio validation:13/13 ffprobe/decode/volume/text and audio hashes PASS, no duration warnings. No auditory listening claimed by this worker.
- ElevenLabs response headers report a total of4014 character-cost credits across13 calls. No precise monetary cost available; actual MP3 payloads and provider headers preserved externally.
- Real BX **@dahura/bx1.1.1** router + actual bxPlugin HTTP handler run on Node22. Procedures guide.get, photo.explain, photo.confirm; typed client/provider exports in src/features/photo-guide/bx-client.tsx. See .handoff/bx-contract.md.
- Node packaging adapter bundles real BX createBX/bxPlugin/BXError exports with esbuild. CLI-only Bun Glob exports excluded; unused Bun SQLite adapter explicitly throws if requested. No DB in this app. Specified query/mutations actually executed successfully. This profile does not advertise Bun SQLite/CLI runtime features.
- Verified guide JSON is embedded in server bundle at build time; no runtime cwd/public-file lookup. Rebuilt after final factual/practical patch at11:16:54UTC. Independent full build PASS11:17:25UTC; real browser source=bx,count13,museumNotice=true,officialDuration=true,dateType=string.
- Same-origin P0 fixed by explicit Vite proxy changeOrigin:false. Strict origin checks retained. At11:11:57UTC POST through http://127.0.0.1:5173 with legitimate browser Origin returned200 and13stops. Direct8788 also200.
- Real OpenAI vision **gpt-5.4-mini** checked11:10:06UTC: CityGate → identifiedID1 with visible evidence and official RPBW source; confirm → exact verified guide history; unrelated Wikimedia cat →unknown, no stop/source invented. MIME mismatch415 and cross-origin403 tested. Basic budget returns429+Retry-After without blocking guide.get200.
- Photo component supports camera/file, local preview, resize/EXIF stripping, change/delete, explicit send, cancel, optional opted-in location, candidate confirmation, official source links and clear errors. No photos persisted or request bodies logged by app. Per-instance limits are basic, not a globally durable spend cap.
- OPENAI_API_KEY securely piped from existing EnvHub impresme into Vercel Preview+Production as Secret, names-only listing verified. VITE_PHOTO_GUIDE_ENABLED=true set as nonsecret Config after real vision checks. Frontend default remains integration worker's responsibility; no default-on changes by platform going forward.

## Deployment blocker — exact result

Preview attempt at11:11:57UTC failed before upload/build with **Challenge required**. CLI provided no HTTP status, verification URL, deployment ID or URL. Its generic403 access hint does not establish that team permissions caused the challenge. Scope is verified dahuras-projects; no switch to another/personal team attempted. A single legitimate interactive device login was approved and completed at11:23UTC. Verify account/team, then one authorized ordinary deploy retry. Expected alias https://valletta-nocturne.vercel.app remains **not confirmed/live** until a successful deployment and HTTP check.

## Coordination / pending

- Frontend integration worker has exclusive main/App/lib/bx/features/guide ownership; platform owns API/photo code, package/build/config, audio, Git/deploy.
- Content assets/PDF/maps and Cathedral museum-only closure/shortened-visit practical patch are final. PDF SHA256027703dd19e5d1288f3323f7753e6b742f6c6c48ca95ed07a6729bd05f79a8bc,24pages90×160mm,5,231,824bytes. Narration remains frozen; do not regenerate audio.
- All required independent full-build/core/media/GPS checks passed. Deploy after verified fresh auth, preserving dahura/dahuras-projects scope.
- Local API restarted once at11:17:07UTC on127.0.0.1:8788 via EnvHub, with final embedded catalog and fresh local quota. Independent known-photo check11:18:15UTC passed200/identifiedID1/officialsource.
- Native T3 browser opened, but two snapshots failed: Preview automation snapshot timed out after15000ms. This worker claims API-level integration checks, not full browser/physical-device photo interaction coverage. Parent's independent browser verifier covers integrated UI.

## Evidence root

All new QA/API/audio artifacts: /Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne . No new worktree; source stays in original shared scratch.

- audio-final/20261030T110036Z-4ac4e398 — source narration hash,13 payloads/MP3 originals, manifest, usage
- audio-final-validation/20261030T110318Z-c5218834 —ffprobe, decode/volume, hash alignment
- photo-real-integration/20261030T110957Z-7e2e11f5 —two actual vision calls, known/unknown results, explicit confirmation, QA images/credits
- bx-integrated-build/20261030T111106Z-b84b3f48 —integrated full build PASS
- bx-same-origin-fixed/20261030T111157Z-049131de —200 with legitimate Origin,13stops
- bx-budget-guard/20261030T111227Z-da5d884f —429+Retry-After while guide.get200
- vercel-preview/20261030T111157Z-fb64f8f0 —exact deployment challenge error

## Secrets result

EnvHub project impresme: ELEVENLABS_API_KEY and OPENAI_API_KEY present and accepted. Missing keys:none. Deployed: OPENAI_API_KEY to Vercel Preview/Production; ElevenLabs key only local process injection. Agent read secret values:no. No frontend key or .env values published.
