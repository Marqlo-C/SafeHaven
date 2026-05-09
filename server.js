/**
 * Custom Next.js server.
 *
 * Responsibilities:
 *  1. Boot the Next.js renderer.
 *  2. Create a raw Node HTTP server so Socket.io can attach to it.
 *  3. Delegate feature initialization to the orchestrator (src/app.js).
 *
 * WHY a custom server: Next.js's built-in server doesn't expose the raw
 * http.Server instance, which Socket.io requires for WebSocket upgrades.
 */

require('dotenv').config();

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { initFeatures } = require('./src/app');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const hostname = dev ? 'localhost' : '0.0.0.0';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? '*' : process.env.ALLOWED_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  // Hand the Socket.io instance to the feature orchestrator.
  initFeatures(io);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port} [${dev ? 'dev' : 'production'}]`);
  });
});
