import 'dotenv/config';
import { createServer } from 'http';

import app from './app';

const port = Number(process.env.PORT || 5001);

const server = createServer(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
