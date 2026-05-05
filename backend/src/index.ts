import { buildApp } from './app';
import { redis } from './plugins/redis';
import pool from './db/pool';
import config from './config';

async function start() {
  const app = await buildApp();

  // Connect to Redis before accepting traffic
  await redis.connect();

  // Verify DB connection
  await pool.query('SELECT 1');
  app.log.info('PostgreSQL connected');

  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    app.log.info(`🐎 خيّال Backend running on port ${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    await redis.quit();
    await pool.end();
    process.exit(1);
  }
}

start();
