import { createServer } from 'node:http'
import handler from '../src/features/photo-guide/server'

const port = Number(process.env.PHOTO_API_PORT ?? 8788)
const server = createServer((req, res) => { void handler(req, res) })
server.requestTimeout = 30_000
server.headersTimeout = 10_000
server.listen(port, '127.0.0.1', () => console.log(`BX API ready on http://127.0.0.1:${port}/api/bx (no photo bodies logged)`))
