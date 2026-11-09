import 'dotenv/config';
import app from './app';
import { prisma } from './shared/database/prisma';

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be between 1 and 65535');
for (const name of ['DATABASE_URL', 'JWT_SECRET', 'GEMINI_API_KEY']) {
  if (!process.env[name]) throw new Error(`${name} is required. See .env.example.`);
}
const server = app.listen(port, () => console.log(`API listening on port ${port}`));
let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  const deadline = setTimeout(() => process.exit(1), 10000);
  deadline.unref();
  server.close(async () => {
    await prisma.$disconnect();
    clearTimeout(deadline);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
