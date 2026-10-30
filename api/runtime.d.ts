declare module '*.mjs' {
  const handler: (request: import('node:http').IncomingMessage, response: import('node:http').ServerResponse) => Promise<void>
  export default handler
}
