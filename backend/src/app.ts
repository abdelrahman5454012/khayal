import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import config from './config';
import jwtPlugin from './plugins/jwt';
import authRoutes from './routes/auth';

export async function buildApp() {
  const app = Fastify({
    logger: config.NODE_ENV === 'development'
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : true,
  });

  // Global plugins
  await app.register(cors, { origin: true });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  // Auth plugin (makes fastify.authenticate available)
  await app.register(jwtPlugin);

  // Routes
  await app.register(authRoutes, { prefix: '/api/v1' });

  // Health check
  app.get('/health', async () => ({ status: 'ok', service: 'khayal-backend' }));

  return app;
}
