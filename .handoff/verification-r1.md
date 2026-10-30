# Независимая проверка R1 — 30.10.2026, 11:18 UTC

**Результат: локальный кандидат PASS по core; открытых P0/P1 в проверенном состоянии нет. Публикация и публичный smoke BLOCKED: URL не выдан, по сообщению платформы Vercel требует Challenge.** Это не утверждение готовности публичного сайта.

Работал read-only: продукт не редактировал, пакеты не устанавливал, Git/деплой не выполнял. Единственный проектный файл verifier — этот отчёт. QA, снимки и сборка находятся на проверенном Lexar. Native T3 snapshot дважды вернул `Preview automation snapshot timed out after 15000ms.`; использован отдельный Playwright CLI-контекст. `lexar.py playwright` оказался обёрткой `playwright test`, не CLI (`unknown option --session`); CLI затем запускался через `lexar.py qa` из внешнего каталога. Два начальных собственных CLI-файла перенесены на Lexar; последующие писались там.

## Проверенное состояние

Проект: `/Users/uladzimirdahura/.t3/scratch/2026-10-30-30-10-2026-41-42-a9d0fc02`.
Git: UNBORN HEAD, коммита ещё нет; продуктовые каталоги untracked. Вместо SHA коммита сохранены SHA256 40 файлов, dirty status и время:
`/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/verification-r1/20261030T110935Z-97439da8/state-final.json` (11:17:06 UTC, повторно сверено 11:18:15, source/package/lock неизменны после сборки).
Ранние снимки: `state-initial.json`, `state-1113.json` в том же каталоге. Между проверками изменились App, валидатор даты, практические данные, генератор/PDF и vercel.json; финальные BX, практика, PDF и сборка проверены адресно заново. Player, personal-route, use-location и MapView остались неизменны.

Финальный PDF SHA256: `027703dd19e5d1288f3323f7753e6b742f6c6c48ca95ed07a6729bd05f79a8bc`.
Package SHA256: `38d8781a2b992a90227851af67a47a1e2c94a8dc299a6ec510fcb47fd65b4283`.
Lock SHA256: `d446cf1cebefe3e6ae4733dd8deaffeb85cd92fa6a23c2c47bd15a1a5de4bc90`.

## PASS

- **Полная сборка:** один независимый `npm run build -- --outDir "$QA_OUTPUT/dist"`: настоящий Node BX bundle, `tsc --noEmit`, Vite — exit0. Доказательство: `verification-build-final/20261030T111705Z-e7574a76/console.log`. Bundle создан в Lexar. В клиентских JS отсутствуют OPENAI_API_KEY, ELEVENLABS_API_KEY, upstream Responses URL и серверный модуль. Это структурная проверка границы, не чтение значений секретов.
- **React + BX:** установленный @dahura/bx реально используется; BXAppProvider оборачивает App, typed guide.get query вызывает BX HTTP plugin через Node adapter. Backend router импортируется клиентом только как type. Свежий браузер: HTTP200, 13 точек, `data-guide-source=bx`, date строка, актуальная музейная оговорка и 1ч45 уже в API. Доказательство: `verification-bx-final-inspect/20261030T111719Z-75cc6aec/console.log`.
- **Аварийная загрузка:** принудительный HTTP403 и задержка BX6500мс в отдельном тестовом route interception: полный статический каталог13 и кнопка старта появились до6с; настоящий BX-запрос пытался выполниться. Interception снят, нормальная загрузка повторена. `verification-browser-fallback/20261030T111401Z-ff784fe4/console.log`. Проверка calendar-date normalization финальной версией сделана отдельно через source=bx.
- **Мой маршрут / 390px:** reorder1 вниз, skip2, visited1, reload сохранили все три состояния; reset очистил их; undo восстановил. Все13 пропущены — карта показывает понятное сообщение, без горизонтального скролла. `verification-browser/20261030T111242Z-923efd02/console.log`.
- **GPS:** до явного действия watch не запускался; атомарный foreground тест с реальной Playwright geolocation fixture CityGate35.896356,14.50946 ±15м показал правильную ближайшую выбранную точку, расстояние по прямой и точность. Stop вызвал native clearWatch (spy). В localStorage нет GPS lat/lng/accuracy/timestamp. Test-only denied callback дал понятный отказ. `verification-browser-gps/20261030T111600Z-978c8f9d/console.log`. Первые повторы не засчитаны: неверная координата fixture, затем потеря foreground между CLI-командами; это не продуктовые дефекты. Скриншоты gps-granted-390.png и gps-denied-390.png в основном каталоге verifier.
- **Плеер / экраны:** вход на остановку без autoplay; реальный MP3 01 играет, currentTime>0, audio.error отсутствует; pause работает. Next02 и Previous01 корректны, Next не включает аудио сам. На320px горизонтального overflow нет, нижняя граница плеера не пересекает верх bottom nav; на1440px overflow нет. `verification-browser-audio/20261030T111523Z-d9f5a982/console.log`; stop-player-320.png и stop-1440.png.
- **Медиа:** ровно13MP3, независимый ffprobe57.6–66.3с, все13 narrationSha256 и audioSha256 совпали с манифестом; все13 фото существуют и имеют author/license/Commons card. HTTP MIME локально корректны: guide JSON, PDF application/pdf, MP3 audio/mpeg, карта image/png. `verification-media/20261030T111027Z-c0e1db76/media.json`. После неизменности этих файлов повтор не выполнялся. Фактическая генерация голоса — существующий Halloween Velvet C selected, не новый голос для этого гида.
- **PDF / карты:** независимый полный render24 страниц первоначального финала, просмотр четырёх contact sheets + крупная страница5; ровно13 single-stop pages5–17 с Что это / История / На что смотреть. Глифов за страницей нет; читаемая кириллица, один столбец, фото и атрибуция. Картаобзор и2 фрагмента имеют номера, реальные улицы, направление и ©OSM. После правки адресно перерендерены и просмотрены1/4/18/21; новый SHA выше, все24 страницы90×160мм,5,231,824байта. `verification-pdf/20261030T111213Z-a0a24d21/`, `verification-practical-patch/20261030T111617Z-5924a501/changed-pages.jpg`.
- **Факты:** все13 текстов прочитаны; госпитальеры не названы тамплиерами; выдуманных легенд нет, художественные впечатления помечены. Siege Bell правильно относится ко Второй мировой/1992, звон и доступ не обещаны. Независимо перепроверены официальные страницы собора, Saluting Battery, автобусного тарифа и сообщения Heritage Malta о колоколе. Опубликованные часы отделены от разовых закрытий и live availability. Исчерпывающий аудит всех исторических дат повторно не проводился.
- **API ограничения:** invalid confirm14 и SVG MIME →422; invalid base64→400; malformed JSON→400; declared body>1,450,000→413 без передачи фото. Бюджет5/10мин фактически возвращал429; лимит не ослаблялся. Код не принимает произвольные image URLs, JPEG/PNG/WebP проверяются magic bytes/размерами, metadata удаляется, upstream фиксирован. Лимиты in-memory на экземпляр, не глобальная гарантия расходов. Доказательства `verification-api-negative/20261030T111214Z-719fbb9a/`, `verification-limit413/20261030T111441Z-7c91154e/`.
- **Реальная vision API:** один независимый запрос с публичным Wikimedia фото CityGate →HTTP200 identified stopId1, три видимых признака, официальный источник Renzo Piano Building Workshop. Фото/секреты в логи не записывались, сохранена только безопасная сводка: `verification-photo-known/20261030T111744Z-07841d72/summary.json`.

Все относительные evidence paths выше начинаются с `/Volumes/Lexar 4TB/artifacts/runs/valletta-nocturne/`.

## Исправленные findings

P0: browser Origin5173 был отвергнут403 из-за proxy Host8788; отправлено родителю11:10. После исправления легитимный POST200, затем финальный source=bx13. Fallback отдельно защищает core от сбоя API.

P1: официальный собор публикует Museum closure и рекомендует1ч45; исходная практика этого не отражала. Отправлено11:11. Новые guide/practical/PDF явно различают музей и собор/ораторий/Караваджо, сокращённый авторский осмотр55–70мин и полный. Страницы18/21 проверены чистыми.
Источник: https://www.stjohnscocathedral.com/visit/ . Остальные независимые первичные источники: https://www.salutingbattery.com/ ; https://www.publictransport.com.mt/rates-offers-local/ ; https://heritagemalta.mt/news/heritage-malta-entering-new-phase-of-siege-bell-memorial-restoration-with-support-from-the-malta-airport-foundation/ .

## Ограничения / остаток

- **BLOCKED public release smoke:** публичный URL не предоставлен. Не проверены публичные website/JSON/PDF/MP3/maps, deployed BX/vision, доступность из внешней сети и production feature flag. По сообщению platform: Vercel Challenge required. Родитель делает отдельный публичный smoke после публикации.
- Photo UI локально default false: camera/upload→preview→explicit-send flow не проверен независимо. Known-photo API проверена выше; unrelated→unknown подтверждено только автором платформы, не этим verifier. Не выдавать это за полный end-to-end PASS.
- GPS denied — тестовый callback, не настоящий отказ OS; accuracy-circle присутствует в реализации, radius отдельно не измерялся. Outside/poor accuracy, hidden-page stop, недоступный GPS, timeout и физический телефон отдельно не засчитаны. Кнопка stop/clearWatch и отсутствие GPS persistence проверены.
- Не проверены custom point submit, keyboard/200% zoom, corrupted/blocked localStorage и все13 записей слухом. Core readable fallback и текущая real audio01 покрыты.
- **P2 editorial, accepted freeze:** stop6 sections/narration всё ещё говорят «Для полного посещения оставьте около часа» (guide.json183/187), в то время как исправленная практика уточняет официальный1ч45 и сокращённый55–70мин. По явной инструкции владельца13stop sections/narration не менялись, новый TTS не запрашивался. Практика содержит корректный ориентир; не считать эту старую фразу рекомендацией полного осмотра.

Никаких commit/deploy/PR действий verifier не выполнял.
