import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const output = process.env.QA_OUTPUT
if (!output) throw new Error('Run through lexar.py qa; photo QA files must stay outside source.')
const endpoint = process.env.PHOTO_CHECK_ORIGIN ?? 'http://127.0.0.1:8788'
async function post(path, input) {
  const started = Date.now()
  const response = await fetch(`${endpoint}/api/bx/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(28_000) })
  const value = await response.json()
  return { status: response.status, milliseconds: Date.now() - started, value }
}
const guide = await post('guide/get', {})
assert.equal(guide.status, 200)
assert.equal(guide.value.stops.length, 13)
await writeFile(join(output, 'guide-query.json'), JSON.stringify(guide, null, 2))
console.log(JSON.stringify({ check: 'BX guide.get', status: guide.status, stops: guide.value.stops.length }))

const known = await sharp(await readFile('public/images/01-city-gate.jpg')).rotate().resize(1400, 1400, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer()
await writeFile(join(output, 'known-city-gate.jpg'), known)
const match = await post('photo/explain', { image: { mimeType: 'image/jpeg', base64: known.toString('base64') } })
await writeFile(join(output, 'known-response.json'), JSON.stringify(match, null, 2))
console.log(JSON.stringify({ check: 'real vision landmark', ...match }))
assert.equal(match.status, 200)
assert.ok(match.value.stopId === 1 || match.value.suggestedStops?.some(stop => stop.stopId === 1), 'Known landmark must plausibly match City Gate.')
const confirmed = await post('photo/confirm', { stopId: 1 })
await writeFile(join(output, 'confirmed-response.json'), JSON.stringify(confirmed, null, 2))
assert.equal(confirmed.status, 200)
assert.ok(confirmed.value.answer.includes(guide.value.stops[0].sections.history))
assert.ok(confirmed.value.sources.length > 0)

// Public Wikimedia test image only, never copied into site assets.
const catResponse = await fetch('https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg', { headers: { 'User-Agent': 'VallettaNocturneQA/1.0 (landmark recognition negative test)' }, signal: AbortSignal.timeout(15_000) })
assert.equal(catResponse.status, 200)
const cat = await sharp(Buffer.from(await catResponse.arrayBuffer())).resize(1024, 1024, { fit: 'inside' }).jpeg({ quality: 80 }).toBuffer()
await writeFile(join(output, 'unknown-cat.jpg'), cat)
await writeFile(join(output, 'unknown-image-credit.json'), JSON.stringify({ author: 'Fir0002/Flagstaffotos', source: 'https://commons.wikimedia.org/wiki/File:Cat03.jpg', license: 'GFDL-1.2 or CC BY-NC 3.0; internal QA only, not published', licenseUrl: 'https://www.gnu.org/licenses/old-licenses/fdl-1.2.html' }, null, 2))
const unknown = await post('photo/explain', { image: { mimeType: 'image/jpeg', base64: cat.toString('base64') } })
await writeFile(join(output, 'unknown-response.json'), JSON.stringify(unknown, null, 2))
console.log(JSON.stringify({ check: 'real vision unrelated image', ...unknown }))
assert.equal(unknown.status, 200)
assert.equal(unknown.value.status, 'unknown')
assert.equal(unknown.value.stopId, undefined)
assert.equal(unknown.value.sources.length, 0)

const mismatch = await post('photo/explain', { image: { mimeType: 'image/png', base64: known.toString('base64') } })
assert.equal(mismatch.status, 415)
const wrongOrigin = await fetch(`${endpoint}/api/bx/guide/get`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://unrelated.example' }, body: '{}' })
assert.equal(wrongOrigin.status, 403)
const report = { checkedAt: new Date().toISOString(), provider: 'OpenAI', model: 'gpt-5.4-mini', realVisionCalls: 2, known: { status: match.value.status, stopId: match.value.stopId, milliseconds: match.milliseconds }, unknown: { status: unknown.value.status, milliseconds: unknown.milliseconds }, verifiedConfirmation: true, mimeMismatchRejected: true, crossOriginRejected: true }
await writeFile(join(output, 'photo-integration.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report))
