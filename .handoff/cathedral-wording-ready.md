# Cathedral wording correction · candidate ready for independent R3

Product code commit: `7e721e759a98c2f3e329f970a97df43c7ffa38c6` (pushed main).
Public production alias: https://valletta-nocturne.vercel.app . Production deployment READY, public checks PASS, v1.0.1 published with both assets verified.

Only wording change: stop6 `sections.what` and verbatim `narration`: «Для полного посещения оставьте около часа» → «Для сокращённого осмотра оставьте около часа». Matching editorial source in scripts/build-guide.py updated. No other facts, IDs, coordinates, directions, practical entries or layouts changed.

Implementation-worker checks PASS (not independent R3):
- Full Node BX + tsc + Vite build with explicit VITE_PHOTO_GUIDE_ENABLED=true.
- Rebuilt bundled catalog: real local POST /api/bx/guide/get returns200 / BX1.1.1 / all13 stop objects exactly equal guide.json.
- 13 manifest source/audio/bytes alignment; only track6 regenerated. Other12MP3, all photos/maps byte-identical. MP3 track6 ffprobe and complete ffmpeg decode PASS,65.620sec /1,050,792bytes.
- Same existing ElevenLabs voice FNr9JM4AKsLQH8gw9NB3 / Halloween Velvet C selected / eleven_multilingual_v2, unchanged script SETTINGS and deterministic seed30102032. No voice created/deleted or subscription changed. EnvHub impresme injection; agent read no secrets.
- PDF24pages90x160mm,11.5pt body. Only page10 content stream changed; other23streams (including12other stop pages and practical18) byte-identical. Rendered10+18 visually inspected: no clipping/overlap.

Evidence: `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/cathedral-wording/20261030T113135Z-f4c78f82`; cathedral-targeted/20261030T113204Z-5d3f7758; cathedral-pdf/20261030T113156Z-b20bb166; cathedral-build/20261030T113221Z-98ff2b34; cathedral-bx-query/20261030T113239Z-7cc7db43; cathedral-production/20261030T113252Z-18df71d7 (all under same external evidence root).

Before→after track6 narration SHA256: `a0eff1f77e5b7152fcfd19d9ae78eba82403bd6271b2a45a90736a23ccf6e3e2` → `4ad2ce833a4c4ffe4b106050f4b50f7bbfdf4921ff44d78438348c60f4985f55`.
Before→after track6 MP3 SHA256: `c7113ba3e6573c124aed80d8eba0829d741515f5c46375004bfed0625545aab0` → `d4cf6118e010625bdca0be41d51e39d9df76c83e35fd3bdf6ca1e7c001b21c96`.
Before→after PDF SHA256: `027703dd19e5d1288f3323f7753e6b742f6c6c48ca95ed07a6729bd05f79a8bc` → `706015c874e145c2ea0219d99239f6e522bebf10aea212f8e7208cd9be13c38f`.
Complete13 narration + all asset before-hashes saved externally in before-hashes.json; guide-before.json and original PDF/manifest also preserved.

Independent R3 targeted public smoke is parent-owned and pending; this worker does not claim independent PASS.

## Complete before→after SHA256 ledger

| ID | Narration before | Narration after | MP3 before | MP3 after |
|---|---|---|---|---|
| 1 | `1736bb038f490254df7fabd6272469fdc566ca8a6581122ada8b388bbb8fbd59` | `1736bb038f490254df7fabd6272469fdc566ca8a6581122ada8b388bbb8fbd59` | `60b3ca006334ce6156e1194673105fe7d5e658d570f300f96b24c8416b1286de` | `60b3ca006334ce6156e1194673105fe7d5e658d570f300f96b24c8416b1286de` |
| 2 | `c9e6bfee998c4ff353abb09f7e93732eaf439984d4fa67494d325fb491b1e1fa` | `c9e6bfee998c4ff353abb09f7e93732eaf439984d4fa67494d325fb491b1e1fa` | `c4ab59a72921ca84caeca833d4c20685dd621db772fd99b645e4dcc45407f2d0` | `c4ab59a72921ca84caeca833d4c20685dd621db772fd99b645e4dcc45407f2d0` |
| 3 | `dc084ff747578bf51a9d5eba0c4ca875f3deb3b72cf7fd89378369a39b69707e` | `dc084ff747578bf51a9d5eba0c4ca875f3deb3b72cf7fd89378369a39b69707e` | `e9c0feae5ece160a423adac2e0ef3259aebd4da9347ac7d00ef79c7d3c1a1e28` | `e9c0feae5ece160a423adac2e0ef3259aebd4da9347ac7d00ef79c7d3c1a1e28` |
| 4 | `b17e272b43b3fa2b50ffaf8f181f46be7c828defccda4a101ac30138f821e7f8` | `b17e272b43b3fa2b50ffaf8f181f46be7c828defccda4a101ac30138f821e7f8` | `7857c5cb4903729ed3fb0e77d6b874610a144da1fd1dc953931b35a3ded8688c` | `7857c5cb4903729ed3fb0e77d6b874610a144da1fd1dc953931b35a3ded8688c` |
| 5 | `db292fb487ee6b1989a480cb2846a17be407869ff8d278b113a62c1e5d2080e3` | `db292fb487ee6b1989a480cb2846a17be407869ff8d278b113a62c1e5d2080e3` | `bf94cac38d793491d07d69cbfae74369117425e567d21b40485147060abd521b` | `bf94cac38d793491d07d69cbfae74369117425e567d21b40485147060abd521b` |
| 6 | `a0eff1f77e5b7152fcfd19d9ae78eba82403bd6271b2a45a90736a23ccf6e3e2` | `4ad2ce833a4c4ffe4b106050f4b50f7bbfdf4921ff44d78438348c60f4985f55` | `c7113ba3e6573c124aed80d8eba0829d741515f5c46375004bfed0625545aab0` | `d4cf6118e010625bdca0be41d51e39d9df76c83e35fd3bdf6ca1e7c001b21c96` |
| 7 | `c9d06c5811adf10b625499a80c4cec5eda01dfebf849bfe7b4ea8301ed194a55` | `c9d06c5811adf10b625499a80c4cec5eda01dfebf849bfe7b4ea8301ed194a55` | `faebc0f1a28b54177aca9325833b1a54524ee9c8fdd3b4979cf1556c3cf498b9` | `faebc0f1a28b54177aca9325833b1a54524ee9c8fdd3b4979cf1556c3cf498b9` |
| 8 | `353bd409fe35317c16c7f7f45456f77f58d5f2a6ccc5d2c46f2e2d93f017ab61` | `353bd409fe35317c16c7f7f45456f77f58d5f2a6ccc5d2c46f2e2d93f017ab61` | `e3ef5fe525cc01998c7163e8dabfd7f7e5b1370bdacdc8a142fb849e5687530e` | `e3ef5fe525cc01998c7163e8dabfd7f7e5b1370bdacdc8a142fb849e5687530e` |
| 9 | `a5b983343ccfca86a073a48793a06594d1f6c1449bd7f314374ce8ac0efe004e` | `a5b983343ccfca86a073a48793a06594d1f6c1449bd7f314374ce8ac0efe004e` | `1afd9b62af66055235501c07e78ecae206c780c3185ab4d8deb2c83b1a4b377a` | `1afd9b62af66055235501c07e78ecae206c780c3185ab4d8deb2c83b1a4b377a` |
| 10 | `1d7607adbac4159ed66c5ec5a0dbfe5b632280fa7b7cb2208b37e2ebc7f8c996` | `1d7607adbac4159ed66c5ec5a0dbfe5b632280fa7b7cb2208b37e2ebc7f8c996` | `c1cd35b1c19ec6a4c8f48f49051d35db67f792f83d7c88cf4167d8f27675f312` | `c1cd35b1c19ec6a4c8f48f49051d35db67f792f83d7c88cf4167d8f27675f312` |
| 11 | `3aa6acbcc4b47eb5454ccf02c80fd3e472c3b1eb021f81cf340c6be7da94fe7d` | `3aa6acbcc4b47eb5454ccf02c80fd3e472c3b1eb021f81cf340c6be7da94fe7d` | `d28fae41dbc0eb643e189de6440e00773c54d5731987beff0ace9b1cf8651892` | `d28fae41dbc0eb643e189de6440e00773c54d5731987beff0ace9b1cf8651892` |
| 12 | `b534f81c00216ca8d03bb308fec45a3c3fe98115cdb5ecda42a0256c1147a7b3` | `b534f81c00216ca8d03bb308fec45a3c3fe98115cdb5ecda42a0256c1147a7b3` | `f78ab7367143467a4e5733bd4fc69955e3a0c55d5dd1896e7807a06d5e3b42e8` | `f78ab7367143467a4e5733bd4fc69955e3a0c55d5dd1896e7807a06d5e3b42e8` |
| 13 | `fbadcea212537ce2cfb1ed6c85bd0c0bec3264564882206b70c135d477cccf5d` | `fbadcea212537ce2cfb1ed6c85bd0c0bec3264564882206b70c135d477cccf5d` | `dad80e8d447dca10afb8458ead2ce1ce13d9577f5c33f744d481697512681511` | `dad80e8d447dca10afb8458ead2ce1ce13d9577f5c33f744d481697512681511` |

## Published production verification

- Deployment ID: `dpl_7MmLGAYDv2gRpS7ev8ZjVoJab6KV`. Immutable deployment: https://valletta-nocturne-jdtyt2ph3-dahuras-projects.vercel.app . Normal allowed scope `dahuras-projects`, production alias unchanged.
- Public POST /api/bx/guide/get:200, BX1.1.1, all13 stop objects equal current guide.json, corrected sections/narration6. Public static guide and complete13-track manifest equal local files.
- Public track6 readback:200/audio-mpeg,1,050,792bytes, SHA256 `d4cf6118e010625bdca0be41d51e39d9df76c83e35fd3bdf6ca1e7c001b21c96`.
- Public PDF readback:200/application-pdf,5,231,833bytes, SHA256 `706015c874e145c2ea0219d99239f6e522bebf10aea212f8e7208cd9be13c38f`.
- Public evidence: cathedral-public/20261030T113341Z-93e958e5 under external root.
- Vercel function packaging emitted pre-existing nonfatal TS2688 node/vite-client warnings. Full application build passed before that; all3explicit API files preserved and live guide.get200 verified. No API wrappers/config/UI modified.
- Other12track manifest records also byte-for-byte logically identical, not just audio bytes.

## Secrets result

EnvHub impresme: required ELEVENLABS_API_KEY1/1 present; used only via local process injection. Missing:none. New target secret deployment:none. User action:none. Agent read secrets:no.

Combined narration SHA256 before→after: `c6acde02c8d93bf5fe344dbbc6d01e07373e27f73db9bb541d570df366d17b9e` → `d4524f295cf898a95be01eb6763ef4ce21e9c081b4b38101edc3dadbe2f13fa2`.
Actual guide-file SHA256 before→after: `36a7c7eeb41b006151ff8ba52ea45b27dc1bb8f88ed6cd6d6ee7ac089669487a` → `4b89e3b3cb7bc97f40884cefc60c5e6b2c27c2c3d0ea7fb888431ae217469d36`.
New track6 provider response header character-cost:316credits for790characters. Shared subscription counter delta was0immediately after the request; header reports per-call cost. Settings stability0.67, similarity_boost0.75, style0.16, use_speaker_boost=true, speed0.96, seed30102032 match the existing production script. No new auditory-listening claim.

## GitHub release v1.0.1 published

- Release: https://github.com/dahura/valletta-nocturne/releases/tag/v1.0.1
- PDF: https://github.com/dahura/valletta-nocturne/releases/download/v1.0.1/valletta-audioguide-ru.pdf
- All13MP3 ZIP: https://github.com/dahura/valletta-nocturne/releases/download/v1.0.1/valletta-audio-ru.zip
- ZIP13,015,910bytes, SHA256 `e0f97d40114837fe834f4530f8b4adcbd10d827bc2dd6fa739e921a0f9ccc19f`. Server-reported SHA256/size of both uploaded assets match local. v1.0.0 original asset digests preserved.
- Target commit `7e721e759a98c2f3e329f970a97df43c7ffa38c6`. Initial create with short target SHA was rejected422; confirmed no release existed, corrected to fullSHA, one successful publication. No alternate version or overwritten release.
- Packaging and release body stayed external: cathedral-release-package/20261030T113306Z-79890bfb. Publish: cathedral-release-full-sha/20261030T113418Z-44effe99.

Product correction complete and ready for parent's fresh independent R3 targeted smoke. No child tasks launched. Two unrelated pre-existing untracked handoff files were left untouched.
