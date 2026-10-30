# CONTENT READY — 30.10.2026, 11:09 UTC

Content worker complete. Ready for integrated verification and publication. No UI, audio, package, Git or deploy files changed.

## Product outputs

- `public/data/guide.json`: final UTF-8 contract, exactly 13 stable IDs, 10,040 narration characters. Narration/sections frozen and hash checked against the earlier audio snapshot. No legends: no adequately sourced ghost story was established.
- `public/data/route.geojson`: 13 real street-network legs including 13 → 1; **3,655.4 m**, foot profile from FOSSGIS/OSRM. Source URL / checked date / honest limitations / per-leg street names and directions included.
- `public/maps/route-overview.png`, `route-west.png`, `route-east.png`: final local raster maps from actual OSM streets, building footprints and coastline; visible © OpenStreetMap contributors + attribution link text, route arrows and stable stop numbers. **Not a decorative schematic or direct inter-stop diagonals.** Standard tile service returned blocked placeholder images and CARTO required a key; neither appears in final outputs. Final maps use no tiles, only local rasterisation of one OSM API area download.
- `public/images/01-city-gate.jpg` through `13-lower-barrakka.jpg`: all 13 real Wikimedia photos, local. Full author, licence, source card, licence URL and original URL in `public/images/credits.json`; author/licence/card in each guide stop.
- `public/downloads/valletta-audioguide-ru.pdf`: **24 pages, exactly 90 × 160 mm, 5 mm margins, main body 11.5 pt, 5,231,601 bytes (5.2 MB)**, no columns. Pages 1–3 maps, page 4 index, pages 5–17 exactly one stop per page with a photo, pages 18–21 practical details, pages 22–24 full photo credits/licence links. Printed narratives are editorially abridged to preserve readable type; website/audio sections and narration are unchanged. No speculative deployment/audio URL was inserted; does not depend on remote images.

## Arrival and budget

- Palace stop 8: 35.899000, 14.513580, St George’s Square / Republic Street public approach, not Neptune’s Court. OSRM endpoint 14.513620, 35.898958; within 6 m of stop.
- MCC stop 12: 35.899120, 14.518280, Mediterranean Street outside the hospital building. OSRM endpoint 14.518218, 35.899132; within 6 m of stop.
- Both stop coordinates checked against OSM building ways: neither is inside a building footprint. No museum courtyard used as a through route.
- 70–90 min walking with slopes/pauses, 35–45 min stop/audio time, 55–70 min Cathedral, 20–30 min coffee/buffer: about 3–4 h unless queues. Fort variant uses about 90 min **instead of** Cathedral with shorter pauses. Three substantial interiors do not fit this budget.
- 12:00 / 16:00 battery shots are optional time anchors; waiting adds time. Route begins/ends just inside City Gate; allow about 5 min between gate and bus terminal.

## Facts / practical checks

Official sources browsed live on 30.10.2026. Heritage summer schedule was visually inspected as the published 1 March–31 October 2026 image: Fort St Elmo 09–19 (last18:30), Palace10–18 (last17:30). Cathedral09–16:45 last16:00 €15; Battery Mon–Sat09:30–17:30 last17, shots12/16, €3. Published Manoel winter tours11/15 €10 may cancel. Cordina operator07:30–23:00 Mon–Sat; Is-Suq foodcourt11–22, store07–21. Operator winter bus fare€2/person, valid2h, 18Oct2026–12Jun2027; routes41/42 fromVallettaB6 towardsĊirkewwa, verify intended stop and live departure inTallinja.

**Not verified / no live claim:** special access on30Oct2026, garden gate hours or one-off closures, actual shot completion, theatre tour places, café seat availability / exact order price, next bus departure. Bell is a **WWII memorial inaugurated1992**, not a1565 memorial. Heritage Malta21Mar2025 says tolling stopped for structural/restoration reasons; no official restart or unrestricted memorial access was established. HM notices still close Fort’s WWI section4 and Palace’s Throne Room. Published general hours do not guarantee one-off access.

Sources remain clickable in guide/PDF. Link check: main official pages returned200; four Malta government sites reject direct CLI fetch403 but their official page text was available through web browsing; route42 direct-fetch timed out once while official search/web content was available. This is an access-method limitation, not evidence of visitor opening/closure.

## Paper / hero / photo-guide handoff

Recommended hero: `/images/04-upper-barrakka.jpg` (wide warm harbour + saluting guns), immediate credit **Photo: Anton Zelenov · CC BY-SA4.0**. Alternate `/images/11-fort-st-elmo.jpg` wide aerial (Dion Hinchcliffe,CC BY-SA2.0).

Final point9 photo is **Strait Street, Valletta, June2018.jpg**, author **No Swan So Fine**, CC BY-SA4.0, card `https://commons.wikimedia.org/wiki/File:Strait_Street,_Valletta,_June_2018.jpg`. Replaced an ambiguous Wikimedia-labelled stair-street image before final PDF; use current local file/metadata. All image filenames and stop IDs remain stable.

## Evidence on verified Lexar

Base: `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/`.

- `pdf-render/20261030T110557Z-133701c4/`: final source PDF, build details, 24 rendered PNG pages, four contact sheets `pages-01-06.jpg`, `pages-07-12.jpg`, `pages-13-18.jpg`, `pages-19-24.jpg`. All24 pages visually inspected, no overlaps/clipping; photos/maps present.
- `pdf-final-check/20261030T110704Z-150a26da/pdf-final-evidence.json`:24 pages,90x160mm,13 single-stop pages,11.5pt body; all extracted glyphs inside page margins. SHA256 `041ac002c4cfff87e0acc204fc5efe6948b81f269d91f940688a1ccc6a44eeb7`.
- `pdf-compressed/20261030T110847Z-235a7e11/compression-evidence.json`: final 5.2 MB PDF with JPEG compression retained. All24 pages re-rendered; **pixel RMSE exactly0.0** against the visually inspected full-size source, so content/layout are pixel-identical. Final source PDF and24latest PNGs are also in this run.
- `content-release/20261030T110724Z-abe7323b/content-release-evidence.json`:13 stops/photos/legs,3maps, frozen narration hash equality, Palace/MCC arrival checks, scripts AST pass.
- `route-stable/20261030T105854Z-f3de9091/foot-routing-response.json`: original OSRM foot response.
- `maps-publish/20261030T105938Z-bfed18b2/map-evidence.json`; `map-sources/20261030T105430Z-ff157145/osm-area.osm`: actual source geometry / map generation.
- `source-hours-image/20261030T105346Z-b7ed9b2d/official-summer-hours-2026.jpg`: visually checked official seasonal schedule.
- `source-links/20261030T110233Z-48627a07/source-link-evidence.json`: bounded official-link check.

## Build scripts

`build-guide.py` holds researched editorial data, `research-assets.py` handles licensed Commons assets, actual foot route and local OSM raster maps, `build-pocket-pdf.py` creates the pocket PDF from local final assets. Run verification through lexar.py; these scripts require QA_OUTPUT for intermediate files. No new task worktree was created.

## Stable IDs / slugs

01-city-gate — Городские ворота и Парламент

02-royal-opera — Руины Королевской оперы

03-auberge-castille — Оберж-де-Кастий

04-upper-barrakka — Верхние сады Барракка

05-merchant-street — Торговая улица

06-st-john — Собор Святого Иоанна

07-republic-street — Улица Республики

08-grandmasters-palace — Дворец великого магистра

09-strait-street — Стрейт-стрит

10-manoel-theatre — Театр Маноэль

11-fort-st-elmo — Форт Святого Эльма

12-sacra-infermeria — Священная лечебница

13-lower-barrakka — Нижние сады и Колокол осады

