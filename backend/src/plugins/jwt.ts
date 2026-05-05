import fp from 'fastify-plugin';
import jwtPlugin from '@fastify/jwt';
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import config from '../config';

const jwt: FastifyPluginAsync = async (fastify) => {
  await fastify.register(jwtPlugin, {
    secret: config.JWT_SECRET,
  });

  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch {
        reply.code(401).send({ error: 'UNAUTHORIZED' });
      }
    }
  );
};

export default fp(jwt);
