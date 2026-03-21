import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://145.132.97.45:6379', {
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

export default redis;
