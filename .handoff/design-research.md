# Design research · 30.10.2026

Task intent used unchanged: “Design a phone-friendly Valletta walking audio guide.” Destination: design_tool / Paper. Web references. Images inspected inline from current Mobbin connector, not inferred from titles. Canon uses original Maltese art direction; structural analogies below are not borrowed brand treatments.

## Q1 · Editorial entry: communicate the walk and primary action without a catalogue

Queries: travel destination page; travel hero section (pages 1–2). Qualified: **10/10 unique inspected sections**, three-plus products. Several non-hero candidates rejected (Going stats/two alternating illustration blocks, Tripadvisor beach cards). Travel destination search was weak; only later relevant visual sections counted.

| # | Product / canonical reference | Inspected structural observation / use |
|---|---|---|
| 1 | [TravelPerk](https://mobbin.com/sites/sections/248d0038-1aa0-4aae-95fd-5dda4d1182ef) | Headline dominates with product evidence below; keep entry hierarchy, omit floating promo widgets. |
| 2 | [Tripadvisor](https://mobbin.com/sites/sections/b6fb3260-e708-4991-bf58-a0e7c0b861a1) | Copy and travel photograph share horizontal hero; clear local action. |
| 3 | [Tripadvisor](https://mobbin.com/sites/sections/4c18737d-3f81-41c4-928b-649b8f2f94c9) | Large image banner gives the trip a place; no search field needed for fixed itinerary. |
| 4 | [Wise editorial](https://mobbin.com/sites/sections/7d53cd10-e431-46aa-a81a-bf307499a6b2) | Real destination photography, title and reading metadata in one vertical sequence. |
| 5 | [Trawelt](https://mobbin.com/sites/sections/07e71cd4-4d6a-4ffc-b583-6e9484302cd6) | Short serif headline on spacious dark ground; typographic pacing useful, metaphorical business imagery omitted. |
| 6 | [TravelPerk](https://mobbin.com/sites/sections/f50ea8bf-05c4-4fb0-b84c-36bb5728450d) | Asymmetric copy/photo split supports one proposition before further detail. |
| 7 | [Flighty](https://mobbin.com/sites/sections/77ec2648-24d1-4a01-8650-7d0323f0b01c) | Single primary action separated from short supporting text; no competing dense controls. |
| 8 | [Trawelt editorial](https://mobbin.com/sites/sections/b842e6cd-cfa3-4bf1-88bf-725e237a9875) | Oversized architectural photograph and mixed serif/sans hierarchy, no surrounding card shell. |
| 9 | [Going stories](https://mobbin.com/sites/sections/6d912921-ea17-4617-85a6-29686aac20c3) | Person/place image carries atmosphere; headline and action form a coherent block. |
| 10 | [Going](https://mobbin.com/sites/sections/046e0922-5aa1-4346-bfb6-6ab4d13aaa34) | Large destination photo beside headline; avoid its curved mask to keep documentary tone. |

Decision: editorial masthead + asymmetric title/prose + two actions + genuine full-width harbour photo. Compared full-bleed overlaid title (legibility risk on sunny phone), tiled travel catalogue (wrong job), and chosen text-on-paper/photo-below composition (readability and place identity). Phone stacks title, intro, reachable CTA, photo.

## Q2 · Route orientation: map in context with chosen stop and next action

Queries: map with walking route; travel map; komoot route details. Qualified: **10/10 unique inspected screens**. Out-of-domain map placements count only for spatial/interaction structure. Rejected incident.io routing, Duolingo path and Cofounder canvas: not geographical navigation.

| # | Product / canonical reference | Inspected observation / use |
|---|---|---|
| 1 | [GetYourGuide](https://mobbin.com/screens/a5478d0b-c08c-4c86-b3ea-df2b2a51f0e1) | Map takes majority width, results remain in a narrow companion list. |
| 2 | [H&M](https://mobbin.com/screens/8c2cda9c-12dd-4cc2-8e9b-83acda6fb1cf) | Selected place detail has explicit Get Directions action adjacent to map. Structural analogy, not travel content. |
| 3 | [GetYourGuide](https://mobbin.com/screens/7d8762de-2deb-4393-8667-dd8751d3b206) | Dense city map and place rows share context, markers avoid a separate navigation flow. |
| 4 | [Zillow](https://mobbin.com/screens/f2cdd907-58a7-48b1-8675-0adea2a1bd0e) | Short route rendered on map above destination text; travel estimate contextual rather than decorative. |
| 5 | [Turo](https://mobbin.com/screens/bb8c2a2a-cdaa-42e6-b2f2-b82cc77ff4f6) | Place list overlays map; selection and spatial position remain together. |
| 6 | [komoot](https://mobbin.com/screens/4269591c-ad31-4808-936e-b1d2e26a1b5f) | Large map, compact fixed tool rail; no city imagery competing with route. |
| 7 | [Notion map](https://mobbin.com/screens/aed88d60-a44c-4aad-8831-2b60cde60bac) | Map pins show a small local preview instead of moving to a different destination. Structural analogy. |
| 8 | [Telescope](https://mobbin.com/screens/2d6a5aa4-b712-469e-bd2b-df2f51266fe1) | Place title, embedded map and direct external map action clearly connected. |
| 9 | [komoot route list](https://mobbin.com/screens/f2704e37-3720-4f9d-afbb-1defc2c17cb2) | Ordered route options beside mapped lines; adopts list/map relationship, omits filters. |
| 10 | [komoot route detail](https://mobbin.com/screens/eaf46e91-3997-4608-bc1f-a070bcb1469b) | Story description, numbered start/end and navigation action accompany a visible actual route. |

Decision: Leaflet loads only on Карта, uses supplied street-network GeoJSON and numbered markers, selected point links to story and OSM directions. A list is kept for accessible selection. Static overview/west/east maps remain available; no geolocation request needed. Full-screen map-only alternative would hide the short story and next walk instruction.

## Q3 · Listen and read: preserve story context and persistent real playback

Queries: audio player; podcast episode player. Qualified: **10/10 unique inspected relevant screens**. The near-identical Higgsfield play/pause result was excluded. Non-player NYT short-video reading result excluded.

| # | Product / canonical reference | Inspected observation / use |
|---|---|---|
| 1 | [Voicenotes home](https://mobbin.com/screens/844a9f81-10d2-44d2-be05-099b500ac201) | Compact item with duration and bottom playback strip; current item remains visible. |
| 2 | [NYT episode](https://mobbin.com/screens/159a9f86-1a78-43b0-9a8e-cb61341b1566) | Large editorial title, central transcript action and bottom timeline, plus episodes below. |
| 3 | [SoundCloud track](https://mobbin.com/screens/301a21e9-d189-4959-9e06-efe024cc9c2b) | Persistent transport strip keeps prev/play/next together; detailed page still readable. |
| 4 | [Copilot audio](https://mobbin.com/screens/74a37889-82df-49a1-b944-6eadaf549ae5) | Readable text sits immediately above timeline and download/play actions. |
| 5 | [Higgsfield](https://mobbin.com/screens/70d08781-cbce-431c-8b11-4778b974e282) | Generated clip and compact playback are related in one area; generation controls irrelevant. |
| 6 | [Voicenotes reader](https://mobbin.com/screens/b51e3768-be67-4799-914f-d8d206f33a7e) | Full prose document plus persistent bottom transport; directly relevant to stop narrative. |
| 7 | [NYT transcript](https://mobbin.com/screens/f0ff1345-4b8e-4f6b-a588-9b7592ce57d5) | Transcript is plain well-spaced prose; a modal is unnecessary for our shorter stop. |
| 8 | [SoundCloud master](https://mobbin.com/screens/8161cca7-ab10-4422-97dc-6e4ebf1053e3) | Single large play plus timeline and separate download; no ambiguous waveform-as-decoration. |
| 9 | [Apple Music](https://mobbin.com/screens/b3f29b6f-5884-493c-bbc2-54f25620d5fb) | Song metadata, elapsed time and prev/play/next grouped; big typographic lyrics occupy reading region. |
| 10 | [SoundCloud embed](https://mobbin.com/screens/55047a20-07da-43e7-afc9-9c820478e139) | Compact transport and track rows in constrained embed; autoplay is a separate explicit option. Our guide never autoplays. |

Decision: actual audio element with custom 44px+ transport, real progress/time, download per track, no autoplay. Full stop text remains on page under labelled sections. Player sits above bottom nav on phone and along lower edge on desktop. Missing track disables play, explains absence and preserves reading. Stop selection pauses previous audio; next/previous never start sound automatically.

## UXPeak

All accessed 30.10.2026 through web retrieval, author verified uxpeak. **Text read / illustrations unavailable** for all three: direct Medium fetch returned HTTP403; native T3 browser snapshot timed out twice (raw: “Preview automation snapshot timed out after 15000ms.”). No fabricated visual inspection. Article images are not counted as Mobbin references.

- [Great Bottom Mobile Navigation Bar](https://medium.com/@uxpeak.com/top-ui-ux-design-tips-how-to-design-a-great-bottom-mobile-navigation-bar-part-6-97acd8b28453), 11.12.2023: labels, recognizable icons, active state and separation. Applied to the owner-specified Маршрут/Карта/Практика nav; 44px minimum is a project comfort target. No universal fixed nav dimensions inferred.
- [Tips & Tricks Part 6 + Bonus](https://medium.com/@uxpeak.com/top-ui-ux-design-tips-tricks-every-designer-should-know-part-6-bonus-2f36b80be192), 01.04.2024: distinguish roles using size/weight, consistent icons. Applied Q1/Q2 to serif headline versus small date/meta and fixed alignment of route numbers/actions.
- [Minimizing Interaction Cost](https://medium.com/@uxpeak.com/improve-your-ui-designs-strategies-for-minimizing-interaction-cost-in-ux-ui-design-b5f20de4322a), 21.05.2023: place related controls together; expose choices; segment prose. Applied Q2/Q3 to map→selected stop→story and persistent transport, plus What/History/Look/Legend headings. No “2X better” claim adopted.

## Verification limits

References establish visual alternatives, not measured accessibility or live interaction. Paper screenshots checked spacing, Cyrillic, contrast, alignment and clipping. Frontend browser checks remain separate, with actual guide data/MP3 and at 390/desktop plus narrow phone. Physical-device safe area and tactile feel are unverified.
