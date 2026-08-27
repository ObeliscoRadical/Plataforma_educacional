import { createServer } from './server.js';
import { config } from './config/index.js';

const { server } = createServer();

server.listen(config.port, () => {
  console.log(`
┌────────────────────────────────────────────────────────────┐
│                    DEVELOPER OS KERNEL                     │
│               Terminal Mentorship Platform                 │
│                                                            │
│  ➜ HTTP API Server:   http://localhost:${config.port}/api         │
│  ➜ WebSocket Stream:  ws://localhost:${config.port}/ws            │
│  ➜ SQLite Database:   WAL Mode ACTIVE                      │
│  ➜ System Status:     READY & ONLINE                       │
└────────────────────────────────────────────────────────────┘
  `);
});
