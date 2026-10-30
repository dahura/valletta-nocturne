# Bolt links and stop addresses — implementation handoff

Researched 2026-10-30. Research only; no product, Git, deployment, account, booking or payment changes. Read `public/data/guide.json`: 13 stops, numeric stable IDs 1–13. Existing walking directions must stay walking directions.

**READY FOR WORKER:** `.handoff/bolt-addresses.json` contains all 13 structured records `{id,address,sourceUrls,taxiDestination?}`. Only ID 1 has a separate taxi landmark. Import/copy the address records immediately; no phone answer or further lookup is required.

**Final bounded CTA finding:** the current official Bolt rider download/open CTA uses **`https://bolt.sng.link/Epy3j/o5l4/8p88`** (Singular, not the legacy AppsFlyer link). This is the preferred generic external handoff URL; adding destination query parameters remains unsupported by the evidence. The already-wired `https://m.bolt.eu/` no-query link is an honest generic landing fallback, not a verified direct app opener. See evidence below.

## Immediate recommendation

**Ship address display + explicit copy + an ordinary official Bolt HTTPS link. Do not claim destination prefill.** No current, public, official rider destination-link parameter contract was verified in this bounded research. This means “not verified”, not “Bolt cannot do it”. Do not implement an invented `bolt://` scheme or promote historical/community query examples to a supported API.

Verified ordinary URLs:

- **Preferred issued rider CTA:** <https://bolt.sng.link/Epy3j/o5l4/8p88>. Exact base URL is published by the current [official Bolt homepage JavaScript](https://assets.homepage.bolt.eu/1.24.18/_next/static/chunks/96344-49ff8a8a2aad999c.js), loaded by <https://bolt.eu/en/rides/>. Module `77391` exports rider constant `y3` with this value; module `55408` maps `RIDER` to it; `AppDownloadTrigger` uses that hook to navigate on mobile and render a QR code on desktop. The hook adds attribution fields (`paffn`, `pscn`, `psn`, `pscid`, `psid`, `lc`) and can pass through `_p`; **none is documentation of destination semantics**. Do not invent `_p` payload fields. The exact base URL without extra parameters is sufficient as the issued generic CTA.
- <https://bolt.sng.link/.well-known/apple-app-site-association> explicitly associates rider app `92U855363F.ee.mtakso.client` with `/Apy3j/*`, `/Cpy3j/*`, `/Epy3j/*`, matching the issued CTA path. Driver app `92U855363F.ee.taxify.driver` uses different `/A3rjh/*`, `/C3rjh/*`, `/E3rjh/*` paths. <https://bolt.sng.link/.well-known/assetlinks.json> includes Android rider package `ee.mtakso.client`. This verifies published association intent; it does **not** prove an installed app opens on a particular physical device.
- Actual desktop HTTP fetch of that exact CTA ended at `https://bolt.eu/en/rides/?referrer=singular_click_id%3D<generated-click-id>` with 200 HTML. Thus the observed desktop behavior is official rider landing, with no destination prefill. Physical iOS/Android remain unchecked.
- Legacy <https://bolt.onelink.me/.well-known/apple-app-site-association> also publishes rider app paths `/UdR6/*`, `/UrUS/*`, `/fUKe/*`, `/CgkX/*`, `/sbJ2/*`, `/D5Xs/*`; <https://bolt.onelink.me/.well-known/assetlinks.json> names Android `ee.mtakso.client`. These are real associations, but no exact legacy issued CTA or destination parameter contract was verified. Prefer the current issued Singular CTA, not an invented OneLink path.
- <https://m.bolt.eu/> is Bolt-owned but, in actual HTTP requests from this Mac, redirects to <https://bolt.eu/en-mt/?utm_source=domain-redirect&utm_medium=m-bolt-eu>. It is **not verified as a current app-opening universal link**.
- <https://bolt.eu/en/rides/> is the official rider page, with “Get the app”/“Get Bolt” controls. Use this as the reliable web fallback if choosing a normal site URL. It does not itself prove that clicking a site button directly opens the installed app.
- <https://bolt.eu/.well-known/apple-app-site-association> returns JSON containing `webcredentials.apps`, including rider bundle `92U855363F.ee.mtakso.client` and driver bundle `92U855363F.ee.taxify.driver`. There is **no `applinks` declaration** in that response; webcredentials are not evidence of a universal-link contract. Rider and driver apps are distinct.
- Both <https://m.bolt.eu/.well-known/apple-app-site-association> and <https://m.bolt.eu/.well-known/assetlinks.json> redirected to the ordinary Bolt HTML homepage in this run, not association metadata.
- Bounded legacy checks of `https://m.taxify.eu/.well-known/apple-app-site-association`, `https://m.taxify.eu/apple-app-site-association`, `https://m.taxify.eu/.well-known/assetlinks.json`, and the corresponding `.well-known` files on `https://taxify.eu` also returned Bolt homepage HTML after redirect. Root `https://m.bolt.eu/apple-app-site-association` behaves the same. No contract recovered from them.

Official support search also found <https://bolt.eu/en-tz/support/articles/360003968734/> (“For Drivers”, receiving rides towards the driver's destination). That is a driver filter, **not** a rider link contract. <https://bolt.eu/en-ae/support/articles/360007914159/> concerns editing an existing ride in the app, not prefilling a ride from a website.

### Encoded first-stop diagnostic example — NOT a supported production link

This was an explicitly unverified candidate tested only to observe the official endpoint response. The keys below have **no verified official parameter semantics**:

```text
https://m.bolt.eu/?action=setPickup&destination_latitude=35.8956128&destination_longitude=14.5082709&destination_name=Triton%20Fountain&destination_address=Vjal%20Nelson%2C%20Floriana%2C%20Malta
```

Actual HTTP result with both desktop and iPhone Safari user-agent strings: final 200 HTML at `https://bolt.eu/en-mt/?utm_source=domain-redirect&utm_medium=m-bolt-eu`; the destination query is absent from the final URL. A spoofed mobile user agent is **not** a physical iOS test. Android and installed-app interception were not tested. No physical iOS or Android behavior is claimed.

The percent encoding above is syntactically valid (`Triton%20Fountain`, `Vjal%20Nelson%2C%20Floriana%2C%20Malta`), but correct encoding does not establish support for those keys. **Production URL for the preferred generic handoff has no destination parameters**: `https://bolt.sng.link/Epy3j/o5l4/8p88`. The already-wired `https://m.bolt.eu/` or explicit `https://bolt.eu/en/rides/` remain ordinary official landing fallbacks. Clipboard text is ordinary decoded text: `Triton Fountain, Vjal Nelson, Floriana, Malta`.

### Interaction and fallback

1. Display the visit address and provide “Скопировать адрес”. For stop 1, copy the separate taxi landmark address below when the user chooses taxi.
2. Provide “Открыть Bolt” as an ordinary HTTPS anchor, activated only by user click. Nearby copy: “Вставьте адрес в Bolt и проверьте точку назначения.” Do not promise that the installed app opens or the destination is prefilled.
3. Keep copy available regardless of navigation outcome. If clipboard permission/API fails, display/select the address for manual copying and report the failure honestly. Do not wait for clipboard completion before opening a popup: prefer separate copy and link controls or a normal anchor.
4. On desktop or without the app, the observed fallback is the Bolt website; the official rider page offers app acquisition controls. No reliable installed-app detection or automatic timed redirect is needed.
5. Booking confirmation, pickup point, price and payment stay with the user inside Bolt. No auto-navigation on page load. Preserve existing OSM walking route.

## Addresses for all 13 existing IDs

These are display/search address strings, assembled from official POI identity and official or actual OSM street names. They are not a claim of a registered postal address or legal taxi stopping place. No invented street numbers or postcodes. Where a mapped street has multiple sections, its pedestrian/access tags apply to that section only.

| ID / existing stop | Suggested `address` | Evidence and interpretation |
|---|---|---|
| 1 — City Gate / Parliament | `City Gate / Parliament House, Republic Street (Triq ir-Repubblika), Valletta, Malta` | [OSM Parliament House](https://www.openstreetmap.org/relation/21084402) has `addr:street=Triq ir-Repubblika`; [nearby Republic Street section](https://www.openstreetmap.org/way/24413565) is pedestrian. Taxi landmark differs; see below. |
| 2 — Royal Opera House ruins | `Pjazza Teatru Rjal (Royal Opera House), Republic Street, Valletta, Malta` | [OSM theatre footprint](https://www.openstreetmap.org/way/55064405) and [adjacent Republic Street](https://www.openstreetmap.org/way/24413565). This is a landmark + adjacent mapped street, not a verified delivery entrance. [Ordnance Street](https://www.openstreetmap.org/way/606084710) is also adjacent and pedestrian. |
| 3 — Auberge de Castille | `Auberge de Castille, Castille Place (Misraħ Kastilja), Valletta, Malta` | [Prime Minister's official institution page](https://primeminister.gov.mt/office-of-the-prime-minister-2/) places the Auberge on its namesake square; [GHRC Castille Square](https://ghrc.gov.mt/portfolio/castille-square/) explicitly names Castille Place and the Auberge. [OSM pedestrian square section](https://www.openstreetmap.org/way/606084724). |
| 4 — Upper Barrakka Gardens | `Upper Barrakka Gardens, Castille Street (Triq Kastilja), Valletta, Malta` | [Science in the City official walking directions](https://scienceinthecity.org.mt/getting-there/) explicitly say exit Upper Barrakka onto Castille Street; [OSM Castille Street](https://www.openstreetmap.org/way/983293663), [garden](https://www.openstreetmap.org/relation/19656097). Garden is pedestrian; this is an approach street, not permission to drive into the park. |
| 5 — Merchants Street | `Merchants Street (Triq il-Merkanti), Valletta, Malta` | [Actual OSM street](https://www.openstreetmap.org/way/534789053), tagged pedestrian. The stop is a street segment; do not invent a house number or guarantee curbside access at its tour pin. |
| 6 — St John's Co-Cathedral | `St John's Co-Cathedral, St John Street (Triq San Ġwann), Valletta, Malta` | [OSM cathedral footprint](https://www.openstreetmap.org/way/23352829) explicitly has `addr:street=Triq San Ġwann`; [St John's Square](https://www.openstreetmap.org/way/31232944) and [St John Street section](https://www.openstreetmap.org/way/255848300) are pedestrian. This is address research, not a change to the already-correct visitor entrance guidance. |
| 7 — Republic Street | `Republic Street (Triq ir-Repubblika), near Republic Square, Valletta, Malta` | [OSM Republic Square](https://www.openstreetmap.org/way/31232942), adjacent to the existing stop pin; [Republic Street section by the palace](https://www.openstreetmap.org/way/981324813). Central portions are pedestrian. “near Republic Square” is an orientation qualifier, not a postal address. |
| 8 — Grand Master's Palace | `Grand Master's Palace, St George's Square, Valletta, Malta` | [Heritage Malta official Getting Here address](https://heritagemalta.mt/explore/grand-masters-palace/). Square/visitor landmark; no assertion of legal taxi drop-off in the square. |
| 9 — Strait Street | `Strait Street (Triq id-Dejqa), Valletta, Malta` | [Actual OSM street section near stop](https://www.openstreetmap.org/way/244254698), tagged pedestrian; the street has mixed sections including steps elsewhere. Preserve existing visit pin, do not present it as a car pin. |
| 10 — Teatru Manoel | `Teatru Manoel, Old Theatre Street, Valletta, Malta` | [Theatre's official About Us](https://teatrumanoel.mt/about-us/) explicitly gives main theatre entrance on Old Theatre Street; [OSM theatre](https://www.openstreetmap.org/way/33458937). Avoid the different studio/stage-door address on Old Mint Street. |
| 11 — Fort St Elmo | `Fort St Elmo and National War Museum, Mediterranean Street (Triq il-Mediterran), Valletta, Malta` | [Heritage Malta official Getting Here address](https://heritagemalta.mt/explore/fort-st-elmo-national-war-museum/) gives Mediterranean Street; [adjacent OSM road](https://www.openstreetmap.org/way/42714313). No legal stopping-place assertion. |
| 12 — Sacra Infermeria / MCC | `Mediterranean Conference Centre (Sacra Infermeria), Old Hospital Street (Triq l-Isptar), Valletta, Malta` | [MCC official contact](https://mcc.com.mt/contact-us/) gives Old Hospital Street; [OSM approach](https://www.openstreetmap.org/way/516198708) is residential with permissive motor-vehicle access. This does not guarantee today's access or stopping permission. |
| 13 — Lower Barrakka / Siege Bell | `Lower Barrakka Gardens / Siege Bell Memorial, Mediterranean Street (Triq il-Mediterran), Valletta, Malta` | [OSM Lower Barrakka park](https://www.openstreetmap.org/way/27462446) and [adjacent Mediterranean Street](https://www.openstreetmap.org/way/22778642). The street is an approach to the park/bell area; no driving into the garden, no exact legal taxi bay claimed. |

All cited OSM elements were read from the actual live API extract <https://api.openstreetmap.org/api/0.6/map?bbox=14.5065,35.8935,14.521,35.9025>, saved externally (below). They are evidence of mapped names and geometry, not an authoritative statement of current transport restrictions.

## First stop: separate visit address from taxi landmark

Use `Triton Fountain, Vjal Nelson, Floriana, Malta` for the requested taxi landmark. [Science in the City Getting There](https://scienceinthecity.org.mt/getting-there/) names Triton Fountain on Vjal Nelson, directly outside City Gate by the main bus terminus, and at the end of Vjal Nelson. “Floriana” is the owner's requested locality label; the festival page labels it Il-Belt Valletta, so do not describe Floriana as a verbatim quotation from that page.

[OSM fountain polygon](https://www.openstreetmap.org/way/561356942) is the actual mapped Triton Fountain. Approximate centroid calculated from its polygon vertices: **35.8956128, 14.5082709**. This is the fountain landmark, not a car-accessible curb. [Surrounding Triton Square](https://www.openstreetmap.org/relation/18304536) is pedestrian. [Nearby Vjal Nelson section](https://www.openstreetmap.org/way/186576146) has `motor_vehicle=no`. Consequently **do not call Vjal Nelson/the fountain a verified legal taxi stopping point**, and do not automatically move the taxi pin to an invented road point. Let Bolt and the user select the accessible endpoint. Walk onward to City Gate; the existing guide visit coordinate remains `35.896356, 14.50946`.

Suggested note: `Ориентир — фонтан Тритонов у Городских ворот. Площадь пешеходная; проверьте доступную точку высадки в Bolt и пройдите до ворот пешком.`

## Minimal typed contract

```ts
type StopId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
type TaxiDestination = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  note?: string;
  sourceUrl: string;
};
type StopTransport = {
  address: string;
  taxiDestination?: TaxiDestination;
};
type StopTransportById = Record<StopId, StopTransport>;

// At present there are NO verified destination parameter keys.
// Accept no speculative destination params in the production builder.
function buildBoltLink(): string {
  return 'https://bolt.sng.link/Epy3j/o5l4/8p88';
}
const boltWebFallback = 'https://bolt.eu/en/rides/';

const firstStopTaxi: TaxiDestination = {
  name: 'Triton Fountain',
  address: 'Triton Fountain, Vjal Nelson, Floriana, Malta',
  lat: 35.8956128,
  lng: 14.5082709,
  note: 'Ориентир у Городских ворот; площадь пешеходная. Проверьте доступную точку высадки в Bolt.',
  sourceUrl: 'https://www.openstreetmap.org/way/561356942',
};
```

The above code is a recommendation for the implementation agent, not product edits. Populate all 13 `address` strings from the table. Only stop 1 needs the researched separate taxi landmark now. For others omit `taxiDestination` unless a distinct approach is verified; copying their visit address is sufficient for the fallback. Do not derive purported drivable drop-off coordinates from existing sightseeing pins. Any future destination-aware builder must start with an exact official rider contract and use `URL`/`URLSearchParams` to encode only its supported keys, once. Keep native number lat/lng values with decimal points; validate finite/range values.

## Evidence, limits and bounded checks

- Stripe Directory skill applied before web provider lookup: installed CLI `stripe directory search Bolt --format json` returned `[]`. No provisioning/authentication/account setup performed.
- Official search for Bolt deeplink/setPickup/destination-latitude documentation found no supporting public rider parameter contract. This is a bounded negative finding, not proof of absence across private partner systems.
- Actual Bolt HTTP response bodies, association metadata and the OSM XML are stored under verified writable Lexar, via the required `lexar.py qa valletta-nocturne bolt-research -- ...` wrapper:
  - `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-research/20261030T114838Z-61515a6b/` — initial official responses and `console.log`.
  - `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-research/20261030T114901Z-8f2a20a9/` — `osm-valletta.xml` and `console.log`.
  - `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-research/20261030T114954Z-43beebd2/` — encoded candidate HTTP results and response bodies.
  - `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-research-final/20261030T115142Z-846de9c1/` — current official JS, legacy Taxify checks and OneLink association files.
  - `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-cta/20261030T115202Z-1ff96700/` — official issued CTA and hook code.
  - `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/bolt-cta-verify/20261030T115227Z-143c9415/` — current Singular association files and actual CTA desktop response.
- T3 `preview_status` reported unavailable; `preview_open` successfully opened official Bolt rides page in a research tab. Two snapshot attempts returned exactly `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.` No successful browser interaction, screenshot, real mobile app launch or prefilled-destination test is claimed. HTTP response checks suffice for the fallback recommendation; further browser fighting was deliberately bounded.
- No new worktree/source copy. No changes to sections/narration/photos/audio/PDF/GPS/core functionality. Only the requested handoff report and structured address JSON were created.
