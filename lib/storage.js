const { Redis } = require('@upstash/redis');

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const fallback = new Map();

async function set(slug, url) {
  if (redis) {
    await redis.set(`link:${slug}`, url);
  } else {
    fallback.set(slug, url);
  }
}

async function get(slug) {
  if (redis) {
    return await redis.get(`link:${slug}`);
  }
  return fallback.get(slug) || null;
}

async function count() {
  if (redis) {
    const keys = await redis.keys('link:*');
    return keys.length;
  }
  return fallback.size;
}

module.exports = { set, get, count };
